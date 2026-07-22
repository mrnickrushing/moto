"""Security controls shared by the Moto FastAPI application.

The project is Python/FastAPI, so this module provides the same HTTP hardening
normally supplied by Helmet in an Express application.
"""

from __future__ import annotations

import asyncio
import ipaddress
import os
import re
import time
from collections import defaultdict, deque
from dataclasses import dataclass
from typing import Iterable
from urllib.parse import urlsplit, urlunsplit

from fastapi import HTTPException, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

UNSAFE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
SENSITIVE_API_PATH = re.compile(r"/api/payments/status/[^/?#]+")


def csv_values(value: str | None) -> list[str]:
    return [item.strip() for item in (value or "").split(",") if item.strip()]


def normalized_origins(values: Iterable[str]) -> set[str]:
    origins: set[str] = set()
    for value in values:
        parsed = urlsplit(value)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError(f"Invalid trusted origin: {value!r}")
        origins.add(f"{parsed.scheme}://{parsed.netloc}")
    return origins


def safe_public_url(value: str) -> str:
    """Drop query/fragment data and redact high-entropy payment identifiers."""
    parsed = urlsplit(value)
    path = SENSITIVE_API_PATH.sub("/api/payments/status/[redacted]", parsed.path)
    return urlunsplit((parsed.scheme, parsed.netloc, path, "", ""))


def scrub_sentry_event(event: dict, _hint: dict | None = None) -> dict:
    """Remove Moto registration, auth, payment, and contact PII from telemetry."""
    event.pop("user", None)

    request = event.get("request")
    if isinstance(request, dict):
        for key in ("cookies", "data", "env", "headers", "query_string"):
            request.pop(key, None)
        if isinstance(request.get("url"), str):
            request["url"] = safe_public_url(request["url"])

    for breadcrumb in event.get("breadcrumbs", {}).get("values", []):
        if not isinstance(breadcrumb, dict):
            continue
        data = breadcrumb.get("data")
        if not isinstance(data, dict):
            continue
        for key in ("request_body", "response_body", "cookies", "headers"):
            data.pop(key, None)
        if isinstance(data.get("url"), str):
            data["url"] = safe_public_url(data["url"])

    return event


def build_csp(*, production: bool) -> str:
    directives = [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        (
            "img-src 'self' data: blob: https://images.unsplash.com "
            "https://images.pexels.com https://customer-assets-lqy194kg.emergentagent.net"
        ),
        (
            "connect-src 'self' https://*.ingest.sentry.io "
            "https://*.ingest.us.sentry.io"
        ),
        "manifest-src 'self'",
        "worker-src 'self' blob:",
    ]
    if production:
        directives.append("upgrade-insecure-requests")
    return "; ".join(directives)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, *, production: bool):
        super().__init__(app)
        self.production = production
        self.csp = build_csp(production=production)

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Content-Security-Policy"] = self.csp
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Cross-Origin-Resource-Policy"] = "same-origin"
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
        )
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
        response.headers["X-XSS-Protection"] = "0"

        if self.production:
            response.headers["Strict-Transport-Security"] = (
                "max-age=63072000; includeSubDomains; preload"
            )
        if request.url.path.startswith(("/api/", "/admin")):
            response.headers["Cache-Control"] = "no-store"
        return response


class RequestSizeLimitMiddleware:
    """Reject oversized requests before parsers allocate memory for the body."""

    def __init__(self, app, *, max_bytes: int = 131_072):
        self.app = app
        self.max_bytes = max_bytes

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        headers = dict(scope.get("headers") or [])
        raw_length = headers.get(b"content-length")
        if raw_length:
            try:
                too_large = int(raw_length) > self.max_bytes
            except ValueError:
                too_large = True
            if too_large:
                response = JSONResponse(
                    {"detail": "Request body too large"}, status_code=413
                )
                await response(scope, receive, send)
                return

        received = 0
        response_started = False

        class RequestBodyTooLarge(Exception):
            pass

        async def limited_receive():
            nonlocal received
            message = await receive()
            if message.get("type") == "http.request":
                received += len(message.get("body", b""))
                if received > self.max_bytes:
                    raise RequestBodyTooLarge
            return message

        async def tracked_send(message):
            nonlocal response_started
            if message.get("type") == "http.response.start":
                response_started = True
            await send(message)

        try:
            await self.app(scope, limited_receive, tracked_send)
        except RequestBodyTooLarge:
            if response_started:
                raise
            response = JSONResponse(
                {"detail": "Request body too large"}, status_code=413
            )
            await response(scope, receive, send)


class CsrfOriginMiddleware(BaseHTTPMiddleware):
    """Enforce same-site origins for cookie-authenticated state changes."""

    def __init__(self, app, *, allowed_origins: Iterable[str], cookie_name: str):
        super().__init__(app)
        self.allowed_origins = normalized_origins(allowed_origins)
        self.cookie_name = cookie_name

    async def dispatch(self, request: Request, call_next):
        # Login itself carries no cookie yet but still needs an origin check
        # (login CSRF: tricking a browser into signing into an attacker's
        # account). Every other unsafe-method request needs one exactly when
        # it's riding on the session cookie — that covers /api/admin/* and
        # every cookie-authenticated /api/auth/* mutation (change-password,
        # 2fa/*, logout) without having to enumerate paths by hand.
        login_attempt = request.url.path == "/api/auth/login"
        cookie_authenticated = self.cookie_name in request.cookies
        origin_required = login_attempt or cookie_authenticated
        if request.method in UNSAFE_METHODS and origin_required:
            origin = request.headers.get("origin")
            if not origin:
                referer = request.headers.get("referer", "")
                parsed = urlsplit(referer)
                origin = (
                    f"{parsed.scheme}://{parsed.netloc}"
                    if parsed.scheme and parsed.netloc
                    else ""
                )
            if origin not in self.allowed_origins:
                return JSONResponse(
                    {"detail": "Untrusted request origin"}, status_code=403
                )
        return await call_next(request)


def _client_ip(request: Request) -> str:
    direct = request.client.host if request.client else "unknown"
    if os.environ.get("TRUST_PROXY_HEADERS", "false").lower() != "true":
        return direct

    forwarded = request.headers.get("x-forwarded-for", "").split(",", 1)[0].strip()
    try:
        return str(ipaddress.ip_address(forwarded))
    except ValueError:
        return direct


@dataclass(frozen=True)
class RateLimit:
    requests: int
    seconds: int


class RateLimiter:
    """Small in-process rate limiter for abuse-prone public endpoints."""

    def __init__(self, *limits: RateLimit):
        self.limits = limits
        self.buckets: dict[tuple[str, int], deque[float]] = defaultdict(deque)
        self.lock = asyncio.Lock()

    async def __call__(self, request: Request) -> None:
        key = _client_ip(request)
        now = time.monotonic()
        async with self.lock:
            if len(self.buckets) > 10_000:
                self.buckets.clear()
            for index, limit in enumerate(self.limits):
                bucket = self.buckets[(key, index)]
                cutoff = now - limit.seconds
                while bucket and bucket[0] <= cutoff:
                    bucket.popleft()
                if len(bucket) >= limit.requests:
                    retry_after = max(1, int(limit.seconds - (now - bucket[0])))
                    raise HTTPException(
                        status_code=429,
                        detail="Too many requests. Please try again later.",
                        headers={"Retry-After": str(retry_after)},
                    )
            for index in range(len(self.limits)):
                self.buckets[(key, index)].append(now)
