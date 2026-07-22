import hashlib
import io
import logging
import os
import secrets
from datetime import date, datetime, timezone, timedelta
from pathlib import Path
from typing import List, Optional, Annotated, Any, Literal
from urllib.parse import urlsplit
from uuid import uuid4

import bcrypt
import jwt
import pyotp
import qrcode
import qrcode.image.svg
import sentry_sdk
import stripe
from bson import ObjectId
from bson.errors import InvalidId
from dotenv import load_dotenv
from fastapi import (
    FastAPI,
    APIRouter,
    BackgroundTasks,
    Request,
    Response,
    HTTPException,
    Depends,
)
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import DuplicateKeyError
from pydantic import (
    BaseModel,
    Field,
    ConfigDict,
    BeforeValidator,
    EmailStr,
    StringConstraints,
    field_validator,
    model_validator,
)
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from security import (
    CsrfOriginMiddleware,
    RateLimit,
    RateLimiter,
    RequestSizeLimitMiddleware,
    SecurityHeadersMiddleware,
    csv_values,
    scrub_sentry_event,
)

import emailer

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ----------------------------------------------------------------------------
# Config / DB
# ----------------------------------------------------------------------------
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development").strip().lower()
IS_PRODUCTION = ENVIRONMENT in {"production", "prod"}

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "").strip()
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
JWT_ALGORITHM = "HS256"
JWT_ISSUER = "moto-api"
JWT_AUDIENCE = "moto-admin"
ACCESS_TOKEN_MINUTES = 30
ENTRY_PRICE = 100.0
TAX_MODE = "calc_only"  # Stripe Tax calculates at checkout
COOKIE_NAME = "__Host-moto_admin" if IS_PRODUCTION else "moto_admin"

frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000").rstrip("/")
allowed_origins = [frontend_url, *csv_values(os.environ.get("CORS_ORIGINS"))]
if not IS_PRODUCTION:
    allowed_origins.extend(["http://localhost:3000", "http://127.0.0.1:3000"])
allowed_origins = list(dict.fromkeys(allowed_origins))

allowed_hosts = csv_values(os.environ.get("ALLOWED_HOSTS"))
railway_domain = os.environ.get("RAILWAY_PUBLIC_DOMAIN", "").strip()
frontend_host = urlsplit(frontend_url).hostname
if railway_domain:
    allowed_hosts.append(railway_domain)
if frontend_host:
    allowed_hosts.append(frontend_host)
if not IS_PRODUCTION:
    allowed_hosts.extend(["localhost", "127.0.0.1", "testserver"])
allowed_hosts = list(dict.fromkeys(allowed_hosts)) or ["*"]

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

SENTRY_DSN = os.environ.get("SENTRY_DSN", "").strip()
if SENTRY_DSN:
    try:
        traces_sample_rate = min(
            1.0, max(0.0, float(os.environ.get("SENTRY_TRACES_SAMPLE_RATE", "0.1")))
        )
    except ValueError:
        traces_sample_rate = 0.1
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        environment=ENVIRONMENT,
        release=os.environ.get("SENTRY_RELEASE")
        or os.environ.get("RAILWAY_GIT_COMMIT_SHA"),
        send_default_pii=False,
        traces_sample_rate=traces_sample_rate,
        before_send=scrub_sentry_event,
        integrations=[
            StarletteIntegration(
                transaction_style="url",
                failed_request_status_codes={*range(500, 600)},
            ),
            FastApiIntegration(
                transaction_style="url",
                failed_request_status_codes={*range(500, 600)},
            ),
        ],
    )

app = FastAPI(
    title="Moto Mayhem API",
    docs_url=None if IS_PRODUCTION else "/api/docs",
    redoc_url=None,
    openapi_url=None if IS_PRODUCTION else "/api/openapi.json",
)
api_router = APIRouter(prefix="/api")


# ----------------------------------------------------------------------------
# Mongo helpers
# ----------------------------------------------------------------------------
def _validate_object_id(v: Any) -> str:
    if isinstance(v, ObjectId):
        return str(v)
    return str(v)


PyObjectId = Annotated[str, BeforeValidator(_validate_object_id)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    @classmethod
    def from_mongo(cls, doc: dict):
        if not doc:
            return None
        return cls(**doc)

    def to_mongo(self) -> dict:
        data = self.model_dump(by_alias=True, exclude_none=True)
        data.pop("_id", None)
        return data


# ----------------------------------------------------------------------------
# Auth utilities
# ----------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except (TypeError, ValueError):
        return False


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


INVITE_TOKEN_EXPIRY_HOURS = 168  # 7 days


def hash_invite_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def generate_invite_token() -> tuple[str, str, datetime]:
    """Returns (raw_token_for_the_email_link, hash_stored_in_mongo, expires_at)."""
    raw_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=INVITE_TOKEN_EXPIRY_HOURS)
    return raw_token, hash_invite_token(raw_token), expires_at


RESET_TOKEN_EXPIRY_HOURS = 1  # short-lived: this is an active-account credential reset


def generate_reset_token() -> tuple[str, str, datetime]:
    """Returns (raw_token_for_the_email_link, hash_stored_in_mongo, expires_at)."""
    raw_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=RESET_TOKEN_EXPIRY_HOURS)
    return raw_token, hash_invite_token(raw_token), expires_at


# ----------------------------------------------------------------------------
# Two-factor auth (TOTP)
# ----------------------------------------------------------------------------
TOTP_ISSUER = "MOTO Mayhem Rodeo"
MFA_PENDING_TOKEN_MINUTES = 5
BACKUP_CODE_COUNT = 8


def totp_qr_svg(secret: str, email: str) -> str:
    uri = pyotp.TOTP(secret).provisioning_uri(name=email, issuer_name=TOTP_ISSUER)
    img = qrcode.make(uri, image_factory=qrcode.image.svg.SvgPathImage)
    buf = io.BytesIO()
    img.save(buf)
    return buf.getvalue().decode("utf-8")


def generate_backup_codes(count: int = BACKUP_CODE_COUNT) -> list[str]:
    return [f"{secrets.token_hex(4).upper()[:4]}-{secrets.token_hex(4).upper()[:4]}" for _ in range(count)]


def hash_backup_code(code: str) -> str:
    # Normalize so "abcd-1234" and "ABCD-1234" hash the same.
    return hashlib.sha256(code.strip().upper().encode("utf-8")).hexdigest()


def create_mfa_pending_token(user_id: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "iat": now,
        "nbf": now,
        "exp": now + timedelta(minutes=MFA_PENDING_TOKEN_MINUTES),
        "iss": JWT_ISSUER,
        "aud": JWT_AUDIENCE,
        "jti": str(uuid4()),
        "type": "mfa_pending",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def decode_mfa_pending_token(token: str) -> ObjectId:
    try:
        payload = jwt.decode(
            token,
            get_jwt_secret(),
            algorithms=[JWT_ALGORITHM],
            issuer=JWT_ISSUER,
            audience=JWT_AUDIENCE,
            options={"require": ["sub", "iat", "nbf", "exp", "iss", "aud", "jti", "type"]},
        )
        if payload.get("type") != "mfa_pending":
            raise HTTPException(status_code=401, detail="Invalid or expired code challenge")
        return parse_object_id(payload["sub"], detail="Invalid code challenge")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Code challenge expired, please sign in again")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired code challenge")


async def log_admin_action(
    actor_email: str | None, action: str, target: str = "", detail: str = ""
) -> None:
    """Best-effort audit trail for admin-authenticated mutations. Never raises
    into the request path — a logging failure shouldn't fail the action it's
    describing."""
    try:
        await db.admin_actions.insert_one(
            {
                "actor_email": actor_email,
                "action": action,
                "target": target,
                "detail": detail,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )
    except Exception:  # noqa: BLE001
        logger.exception("Failed to record admin action %s", action)


def create_access_token(user_id: str, email: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "email": email,
        "iat": now,
        "nbf": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_MINUTES),
        "iss": JWT_ISSUER,
        "aud": JWT_AUDIENCE,
        "jti": str(uuid4()),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookie(response: Response, access: str):
    response.set_cookie(
        COOKIE_NAME,
        access,
        httponly=True,
        secure=IS_PRODUCTION,
        samesite="lax",
        max_age=ACCESS_TOKEN_MINUTES * 60,
        path="/",
    )


async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(
            token,
            get_jwt_secret(),
            algorithms=[JWT_ALGORITHM],
            issuer=JWT_ISSUER,
            audience=JWT_AUDIENCE,
            options={
                "require": ["sub", "iat", "nbf", "exp", "iss", "aud", "jti", "type"]
            },
        )
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = parse_object_id(payload["sub"], detail="Invalid token subject")
        user = await db.users.find_one({"_id": user_id})
        if not user or user.get("role") != "admin":
            raise HTTPException(status_code=401, detail="Not authorized")
        user["_id"] = str(user["_id"])
        for secret_field in (
            "password_hash",
            "totp_secret",
            "totp_secret_pending",
            "backup_codes_hashed",
        ):
            user.pop(secret_field, None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def parse_object_id(value: str, *, detail: str = "Invalid identifier") -> ObjectId:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=400, detail=detail)


# ----------------------------------------------------------------------------
# Models
# ----------------------------------------------------------------------------
class ApiModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


NameText = Annotated[str, StringConstraints(min_length=1, max_length=120)]
PhoneText = Annotated[str, StringConstraints(min_length=7, max_length=30)]
MessageText = Annotated[str, StringConstraints(min_length=1, max_length=4000)]
PasswordText = Annotated[str, StringConstraints(min_length=1, max_length=256)]
# New/changed admin passwords must meet the same strength floor as ADMIN_PASSWORD.
StrongPasswordText = Annotated[str, StringConstraints(min_length=14, max_length=256)]

ALLOWED_CLASSES = {
    "50cc Pee-Wee (4–6 yrs)",
    "50cc Junior (7–8 yrs)",
    "65cc Class A (7–9 yrs)",
    "65cc Class B (10–12 yrs)",
    "85cc Class A (8–10 yrs)",
    "85cc Class B (11–12 yrs)",
    "110cc Open (12 & Under)",
    "TEEN Teen Class (13–17 yrs)",
    "ADULT Adult Class (18 & Over)",
}


class LoginRequest(ApiModel):
    email: EmailStr
    password: PasswordText


class ChangePasswordRequest(ApiModel):
    current_password: PasswordText
    new_password: StrongPasswordText


class AdminInviteCreate(ApiModel):
    email: EmailStr
    name: NameText


class AdminInviteAccept(ApiModel):
    password: StrongPasswordText


class ForgotPasswordRequest(ApiModel):
    email: EmailStr


class PasswordResetAccept(ApiModel):
    password: StrongPasswordText


TotpCodeText = Annotated[str, StringConstraints(min_length=6, max_length=6, pattern=r"^\d{6}$")]


class TwoFactorVerify(ApiModel):
    code: TotpCodeText


class TwoFactorDisable(ApiModel):
    password: PasswordText


class LoginVerify2FA(ApiModel):
    mfa_token: str
    # A backup code ("XXXX-XXXX") is longer than a TOTP code, so accept either shape here.
    code: Annotated[str, StringConstraints(min_length=6, max_length=20)]


class RegistrationCreate(ApiModel):
    rider_name: NameText
    date_of_birth: str
    age: int = Field(ge=4, le=99)
    tshirt_size: Literal[
        "YXS", "YS", "YM", "YL", "Adult S", "Adult M", "Adult L", "Adult XL"
    ]
    classes: List[str] = Field(min_length=1, max_length=len(ALLOWED_CLASSES))
    parent_guardian: Annotated[str, StringConstraints(max_length=120)] = ""
    email: EmailStr
    phone: PhoneText
    emergency_name: NameText
    emergency_relationship: Annotated[
        str, StringConstraints(min_length=1, max_length=80)
    ]
    emergency_phone: PhoneText
    payment_method: Literal["stripe", "venmo_cash"]

    @field_validator("date_of_birth")
    @classmethod
    def validate_birth_date(cls, value: str) -> str:
        for pattern in (None, "%m/%d/%Y"):
            try:
                parsed = (
                    date.fromisoformat(value)
                    if pattern is None
                    else datetime.strptime(value, pattern).date()
                )
                break
            except ValueError:
                parsed = None
        if parsed is None or parsed > date.today() or parsed < date(1927, 1, 1):
            raise ValueError("Enter a valid date of birth")
        return parsed.isoformat()

    @field_validator("classes")
    @classmethod
    def validate_classes(cls, values: List[str]) -> List[str]:
        if len(values) != len(set(values)):
            raise ValueError("Duplicate classes are not allowed")
        invalid = set(values) - ALLOWED_CLASSES
        if invalid:
            raise ValueError("One or more selected classes are invalid")
        return values

    @field_validator("phone", "emergency_phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        digits = "".join(character for character in value if character.isdigit())
        if not 7 <= len(digits) <= 15:
            raise ValueError("Enter a valid phone number")
        return value

    @model_validator(mode="after")
    def validate_age_and_guardian(self):
        birth_date = date.fromisoformat(self.date_of_birth)
        cutoff = date(2026, 1, 1)
        calculated_age = (
            cutoff.year
            - birth_date.year
            - ((cutoff.month, cutoff.day) < (birth_date.month, birth_date.day))
        )
        if self.age != calculated_age:
            raise ValueError("Age must match the rider's age on January 1, 2026")
        if self.age < 18 and not self.parent_guardian:
            raise ValueError("Parent or guardian is required for riders under 18")
        return self


class CheckoutRequest(ApiModel):
    registration_id: str


class ContactCreate(ApiModel):
    name: NameText
    email: EmailStr
    message: MessageText


SponsorTier = Literal[
    "Champion Buckle Sponsor",
    "Gold Sponsor",
    "Silver Sponsor",
    "Community Partner",
    "Not sure yet",
]


class SponsorInquiryCreate(ApiModel):
    business_name: NameText
    contact_name: NameText
    email: EmailStr
    phone: PhoneText
    tier: SponsorTier = "Not sure yet"
    message: Annotated[str, StringConstraints(max_length=4000)] = ""


class RegistrationUpdate(ApiModel):
    payment_status: Optional[Literal["pending", "paid", "failed", "refunded"]] = None
    notes: Optional[Annotated[str, StringConstraints(max_length=2000)]] = None


login_limiter = RateLimiter(RateLimit(5, 300), RateLimit(20, 3600))
admin_account_limiter = RateLimiter(RateLimit(10, 300), RateLimit(30, 3600))
invite_limiter = RateLimiter(RateLimit(20, 300), RateLimit(60, 3600))
forgot_password_limiter = RateLimiter(RateLimit(5, 300), RateLimit(15, 3600))
reset_password_limiter = RateLimiter(RateLimit(20, 300), RateLimit(60, 3600))
mfa_verify_limiter = RateLimiter(RateLimit(8, 300), RateLimit(25, 3600))
registration_limiter = RateLimiter(RateLimit(5, 600), RateLimit(20, 3600))
contact_limiter = RateLimiter(RateLimit(5, 600), RateLimit(20, 3600))
sponsor_limiter = RateLimiter(RateLimit(5, 600), RateLimit(20, 3600))
checkout_limiter = RateLimiter(RateLimit(10, 600))
payment_status_limiter = RateLimiter(RateLimit(60, 60))
DUMMY_PASSWORD_HASH = hash_password(str(uuid4()))


# ----------------------------------------------------------------------------
# Public routes
# ----------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"message": "MOTO Mayhem Rodeo API"}


@api_router.post("/auth/login")
async def login(
    body: LoginRequest,
    response: Response,
    _rate_limit: None = Depends(login_limiter),
):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if user and user.get("role") == "admin" and user.get("status") == "pending":
        raise HTTPException(
            status_code=403,
            detail="Accept your invite email before signing in.",
        )
    password_hash = (
        user.get("password_hash", DUMMY_PASSWORD_HASH) if user else DUMMY_PASSWORD_HASH
    )
    password_valid = verify_password(body.password, password_hash)
    if not user or not password_valid or user.get("role") != "admin":
        raise HTTPException(status_code=401, detail="Invalid email or password")
    uid = str(user["_id"])
    if user.get("totp_enabled"):
        return {
            "mfa_required": True,
            "mfa_token": create_mfa_pending_token(uid),
        }
    access = create_access_token(uid, email)
    set_auth_cookie(response, access)
    return {
        "id": uid,
        "email": email,
        "name": user.get("name", "Admin"),
        "role": user.get("role"),
    }


@api_router.post("/auth/login/verify-2fa")
async def login_verify_2fa(
    body: LoginVerify2FA,
    response: Response,
    _rate_limit: None = Depends(mfa_verify_limiter),
):
    object_id = decode_mfa_pending_token(body.mfa_token)
    user = await db.users.find_one({"_id": object_id})
    if not user or user.get("role") != "admin" or not user.get("totp_enabled"):
        raise HTTPException(status_code=401, detail="Invalid or expired code challenge")

    code = body.code.strip()
    totp_secret = user.get("totp_secret", "")
    valid = bool(totp_secret) and pyotp.TOTP(totp_secret).verify(code, valid_window=1)

    used_backup_code = None
    if not valid:
        code_hash = hash_backup_code(code)
        for candidate in user.get("backup_codes_hashed", []):
            if secrets.compare_digest(candidate, code_hash):
                valid = True
                used_backup_code = candidate
                break

    if not valid:
        raise HTTPException(status_code=401, detail="Invalid authentication code")

    if used_backup_code:
        await db.users.update_one(
            {"_id": object_id}, {"$pull": {"backup_codes_hashed": used_backup_code}}
        )

    access = create_access_token(str(object_id), user["email"])
    set_auth_cookie(response, access)
    return {
        "id": str(object_id),
        "email": user["email"],
        "name": user.get("name", "Admin"),
        "role": user.get("role"),
    }


@api_router.get("/auth/me")
async def me(admin: dict = Depends(get_current_admin)):
    return admin


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie(
        COOKIE_NAME,
        path="/",
        secure=IS_PRODUCTION,
        httponly=True,
        samesite="lax",
    )
    return {"message": "logged out"}


@api_router.post("/auth/change-password")
async def change_password(
    body: ChangePasswordRequest,
    response: Response,
    admin: dict = Depends(get_current_admin),
    _rate_limit: None = Depends(admin_account_limiter),
):
    object_id = parse_object_id(admin["_id"], detail="Invalid account")
    user = await db.users.find_one({"_id": object_id})
    if not user or not verify_password(
        body.current_password, user.get("password_hash", "")
    ):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if verify_password(body.new_password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from the current password",
        )
    await db.users.update_one(
        {"_id": object_id},
        {
            "$set": {
                "password_hash": hash_password(body.new_password),
                # Once changed in-app, an ADMIN_PASSWORD redeploy won't clobber it.
                "password_self_managed": True,
                "password_updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )
    # Re-issue the session cookie so the current admin stays logged in.
    access = create_access_token(str(object_id), user["email"])
    set_auth_cookie(response, access)
    await log_admin_action(user["email"], "admin.password_change", target=user["email"])
    return {"message": "Password updated"}


@api_router.post("/auth/2fa/setup")
async def setup_2fa(
    admin: dict = Depends(get_current_admin),
    _rate_limit: None = Depends(admin_account_limiter),
):
    object_id = parse_object_id(admin["_id"], detail="Invalid account")
    user = await db.users.find_one({"_id": object_id})
    if not user:
        raise HTTPException(status_code=404, detail="Account not found")
    if user.get("totp_enabled"):
        raise HTTPException(status_code=400, detail="Two-factor authentication is already enabled")
    secret = pyotp.random_base32()
    await db.users.update_one({"_id": object_id}, {"$set": {"totp_secret_pending": secret}})
    return {
        "secret": secret,
        "qr_svg": totp_qr_svg(secret, user["email"]),
    }


@api_router.post("/auth/2fa/verify")
async def verify_2fa(
    body: TwoFactorVerify,
    admin: dict = Depends(get_current_admin),
    _rate_limit: None = Depends(admin_account_limiter),
):
    object_id = parse_object_id(admin["_id"], detail="Invalid account")
    user = await db.users.find_one({"_id": object_id})
    pending_secret = user.get("totp_secret_pending") if user else None
    if not pending_secret:
        raise HTTPException(status_code=400, detail="Start setup before verifying a code")
    if not pyotp.TOTP(pending_secret).verify(body.code, valid_window=1):
        raise HTTPException(status_code=400, detail="Incorrect code — check your authenticator app and try again")
    backup_codes = generate_backup_codes()
    await db.users.update_one(
        {"_id": object_id},
        {
            "$set": {
                "totp_secret": pending_secret,
                "totp_enabled": True,
                "backup_codes_hashed": [hash_backup_code(c) for c in backup_codes],
            },
            "$unset": {"totp_secret_pending": ""},
        },
    )
    await log_admin_action(admin.get("email"), "admin.2fa_enabled", target=admin.get("email"))
    return {"backup_codes": backup_codes}


@api_router.post("/auth/2fa/disable")
async def disable_2fa(
    body: TwoFactorDisable,
    admin: dict = Depends(get_current_admin),
    _rate_limit: None = Depends(admin_account_limiter),
):
    object_id = parse_object_id(admin["_id"], detail="Invalid account")
    user = await db.users.find_one({"_id": object_id})
    if not user or not verify_password(body.password, user.get("password_hash", "")):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    await db.users.update_one(
        {"_id": object_id},
        {
            "$set": {"totp_enabled": False},
            "$unset": {"totp_secret": "", "totp_secret_pending": "", "backup_codes_hashed": ""},
        },
    )
    await log_admin_action(admin.get("email"), "admin.2fa_disabled", target=admin.get("email"))
    return {"message": "Two-factor authentication disabled"}


async def _find_pending_invite(raw_token: str) -> dict:
    """Looks up a pending admin invite by raw token, or raises 404.

    A single generic error is used for "no such token" and "expired" so an
    attacker probing tokens can't distinguish the two.
    """
    token_hash = hash_invite_token(raw_token)
    user = await db.users.find_one(
        {"invite_token_hash": token_hash, "status": "pending"}
    )
    invite_error = HTTPException(status_code=404, detail="Invalid or expired invite link")
    if not user:
        raise invite_error
    expires_at = user.get("invite_expires_at")
    if not expires_at or datetime.fromisoformat(expires_at) < datetime.now(timezone.utc):
        raise invite_error
    return user


@api_router.get("/auth/invite/{token}")
async def get_invite(token: str, _rate_limit: None = Depends(invite_limiter)):
    user = await _find_pending_invite(token)
    return {"name": user.get("name"), "email": user.get("email")}


@api_router.post("/auth/invite/{token}/accept")
async def accept_invite(
    token: str,
    body: AdminInviteAccept,
    response: Response,
    _rate_limit: None = Depends(invite_limiter),
):
    user = await _find_pending_invite(token)
    object_id = user["_id"]
    await db.users.update_one(
        {"_id": object_id},
        {
            "$set": {
                "password_hash": hash_password(body.password),
                "status": "active",
                "password_self_managed": True,
                "password_updated_at": datetime.now(timezone.utc).isoformat(),
            },
            "$unset": {"invite_token_hash": "", "invite_expires_at": ""},
        },
    )
    access = create_access_token(str(object_id), user["email"])
    set_auth_cookie(response, access)
    return {
        "id": str(object_id),
        "email": user["email"],
        "name": user.get("name", "Admin"),
        "role": "admin",
    }


async def _send_invite_email(email: str, name: str, invited_by: str, raw_token: str) -> None:
    accept_url = f"{emailer.site_url()}/admin/accept-invite?token={raw_token}"
    try:
        subject, html = emailer.admin_invite_email(
            name, accept_url, invited_by, INVITE_TOKEN_EXPIRY_HOURS
        )
        await emailer.send_email(email, subject, html, reply_to=emailer.organizer_email())
    except Exception:
        logger.exception("Failed to build/send admin invite email")


async def _send_password_reset_email(email: str, name: str, raw_token: str) -> None:
    reset_url = f"{emailer.site_url()}/admin/reset-password?token={raw_token}"
    try:
        subject, html = emailer.admin_password_reset_email(
            name, reset_url, RESET_TOKEN_EXPIRY_HOURS
        )
        await emailer.send_email(email, subject, html, reply_to=emailer.organizer_email())
    except Exception:
        logger.exception("Failed to build/send password reset email")


@api_router.post("/auth/forgot-password")
async def forgot_password(
    body: ForgotPasswordRequest,
    background: BackgroundTasks,
    _rate_limit: None = Depends(forgot_password_limiter),
):
    # Always return the same response whether or not the account exists, so
    # this endpoint can't be used to enumerate registered admin emails.
    email = body.email.lower()
    generic_response = {
        "message": "If that email has an admin account, a reset link is on its way."
    }
    user = await db.users.find_one({"email": email, "role": "admin"})
    if not user or user.get("status") == "pending":
        return generic_response
    raw_token, token_hash, expires_at = generate_reset_token()
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"reset_token_hash": token_hash, "reset_expires_at": expires_at.isoformat()}},
    )
    background.add_task(
        _send_password_reset_email, email, user.get("name", "Admin"), raw_token
    )
    return generic_response


async def _find_valid_reset(raw_token: str) -> dict:
    token_hash = hash_invite_token(raw_token)
    user = await db.users.find_one({"reset_token_hash": token_hash})
    reset_error = HTTPException(status_code=404, detail="Invalid or expired reset link")
    if not user:
        raise reset_error
    expires_at = user.get("reset_expires_at")
    if not expires_at or datetime.fromisoformat(expires_at) < datetime.now(timezone.utc):
        raise reset_error
    return user


@api_router.get("/auth/reset-password/{token}")
async def get_reset_password(token: str, _rate_limit: None = Depends(reset_password_limiter)):
    user = await _find_valid_reset(token)
    return {"name": user.get("name"), "email": user.get("email")}


@api_router.post("/auth/reset-password/{token}")
async def reset_password(
    token: str,
    body: PasswordResetAccept,
    response: Response,
    _rate_limit: None = Depends(reset_password_limiter),
):
    user = await _find_valid_reset(token)
    object_id = user["_id"]
    await db.users.update_one(
        {"_id": object_id},
        {
            "$set": {
                "password_hash": hash_password(body.password),
                "password_self_managed": True,
                "password_updated_at": datetime.now(timezone.utc).isoformat(),
            },
            "$unset": {"reset_token_hash": "", "reset_expires_at": ""},
        },
    )
    access = create_access_token(str(object_id), user["email"])
    set_auth_cookie(response, access)
    await log_admin_action(user["email"], "admin.password_reset", target=user["email"])
    return {
        "id": str(object_id),
        "email": user["email"],
        "name": user.get("name", "Admin"),
        "role": "admin",
    }


async def _send_registration_emails(reg: dict) -> None:
    rider_email = reg.get("email")
    if rider_email:
        try:
            subject, html = emailer.registration_rider_email(reg)
            await emailer.send_email(
                rider_email, subject, html, reply_to=emailer.organizer_email()
            )
        except Exception:
            logger.exception("Failed to build/send rider confirmation email")
    try:
        subject, html = emailer.registration_organizer_email(reg)
        await emailer.send_email(
            emailer.organizer_email(), subject, html, reply_to=rider_email
        )
    except Exception:
        logger.exception("Failed to build/send organizer registration email")


@api_router.post("/registrations")
async def create_registration(
    body: RegistrationCreate,
    background: BackgroundTasks,
    _rate_limit: None = Depends(registration_limiter),
):
    entries = len(body.classes)
    if entries < 1:
        raise HTTPException(status_code=400, detail="Select at least one class")
    doc = body.model_dump()
    doc.update(
        {
            "entries": entries,
            "total": entries * ENTRY_PRICE,
            "payment_status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
    )
    result = await db.registrations.insert_one(doc)
    background.add_task(_send_registration_emails, dict(doc))
    return {
        "id": str(result.inserted_id),
        "entries": entries,
        "total": entries * ENTRY_PRICE,
    }


@api_router.post("/contact")
async def create_contact(
    body: ContactCreate,
    _rate_limit: None = Depends(contact_limiter),
):
    doc = body.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contacts.insert_one(doc)
    return {"message": "Message received. Ride hard!"}


async def _send_sponsor_emails(inq: dict) -> None:
    applicant_email = inq.get("email")
    if applicant_email:
        try:
            subject, html = emailer.sponsor_applicant_email(inq)
            await emailer.send_email(
                applicant_email, subject, html, reply_to=emailer.organizer_email()
            )
        except Exception:
            logger.exception("Failed to build/send sponsor applicant email")
    try:
        subject, html = emailer.sponsor_organizer_email(inq)
        await emailer.send_email(
            emailer.organizer_email(), subject, html, reply_to=applicant_email
        )
    except Exception:
        logger.exception("Failed to build/send organizer sponsor email")


@api_router.post("/sponsor-inquiry")
async def create_sponsor_inquiry(
    body: SponsorInquiryCreate,
    background: BackgroundTasks,
    _rate_limit: None = Depends(sponsor_limiter),
):
    doc = body.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.sponsor_inquiries.insert_one(doc)
    background.add_task(_send_sponsor_emails, dict(doc))
    return {"message": "Thanks! We'll be in touch about backing the mayhem."}


# ----------------------------------------------------------------------------
# Payments (Stripe)
# ----------------------------------------------------------------------------
@api_router.post("/payments/checkout")
async def create_checkout(
    req: CheckoutRequest,
    _rate_limit: None = Depends(checkout_limiter),
):
    if not stripe.api_key:
        raise HTTPException(status_code=503, detail="Card payments are not configured")
    registration_id = parse_object_id(
        req.registration_id, detail="Invalid registration identifier"
    )
    reg = await db.registrations.find_one({"_id": registration_id})
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")

    prices = stripe.Price.list(lookup_keys=["rider_entry"], active=True, limit=1).data
    if not prices:
        raise HTTPException(
            status_code=500, detail="Price not configured. Run setup_stripe.py"
        )
    price = prices[0]
    quantity = int(reg.get("entries", 1))

    kwargs = dict(
        line_items=[{"price": price.id, "quantity": quantity}],
        mode="payment",
        success_url=f"{frontend_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{frontend_url}/register",
        metadata={"registration_id": req.registration_id},
    )
    if TAX_MODE == "calc_only":
        session = stripe.checkout.Session.create(
            **kwargs,
            automatic_tax={"enabled": True},
            billing_address_collection="required",
        )
    else:
        session = stripe.checkout.Session.create(**kwargs)

    await db.payment_transactions.insert_one(
        {
            "session_id": session.id,
            "registration_id": req.registration_id,
            "amount": (price.unit_amount or 0) / 100 * quantity,
            "currency": price.currency,
            "status": "initiated",
            "payment_status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
    )
    return {"checkout_url": session.url, "session_id": session.id}


async def _mark_paid(session_id: str, payment_intent=None):
    now = datetime.now(timezone.utc).isoformat()
    txn = await db.payment_transactions.find_one_and_update(
        {"session_id": session_id, "payment_status": {"$ne": "paid"}},
        {
            "$set": {
                "status": "completed",
                "payment_status": "paid",
                "stripe_payment_intent_id": payment_intent,
                "updated_at": now,
            }
        },
    )
    if txn and txn.get("registration_id"):
        await db.registrations.update_one(
            {"_id": ObjectId(txn["registration_id"])},
            {"$set": {"payment_status": "paid", "updated_at": now}},
        )


@api_router.get("/payments/status/{session_id}")
async def get_payment_status(
    session_id: str,
    _rate_limit: None = Depends(payment_status_limiter),
):
    if len(session_id) > 255 or not session_id.startswith("cs_"):
        raise HTTPException(status_code=400, detail="Invalid checkout session")
    record = await db.payment_transactions.find_one({"session_id": session_id})
    if not record:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if record.get("payment_status") != "paid":
        try:
            s = stripe.checkout.Session.retrieve(session_id)
            if s.payment_status == "paid" or s.status == "complete":
                await _mark_paid(session_id, s.payment_intent)
                record = await db.payment_transactions.find_one(
                    {"session_id": session_id}
                )
        except stripe.error.StripeError:
            pass
    return {
        "session_id": record["session_id"],
        "status": record["status"],
        "payment_status": record["payment_status"],
    }


@api_router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Stripe webhook is not configured")
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(status_code=400, detail="Invalid signature")
    obj, t = event["data"]["object"], event["type"]
    if t == "checkout.session.completed":
        await _mark_paid(obj["id"], obj.get("payment_intent"))
    elif t == "checkout.session.async_payment_succeeded":
        await _mark_paid(obj["id"], obj.get("payment_intent"))
    elif t in ("checkout.session.async_payment_failed", "checkout.session.expired"):
        await db.payment_transactions.update_one(
            {"session_id": obj["id"]},
            {
                "$set": {
                    "status": "failed",
                    "payment_status": "failed",
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }
            },
        )
    return {"status": "ok"}


# ----------------------------------------------------------------------------
# Admin routes
# ----------------------------------------------------------------------------
def _clean(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


@api_router.get("/admin/registrations")
async def admin_list_registrations(admin: dict = Depends(get_current_admin)):
    docs = await db.registrations.find().sort("created_at", -1).to_list(1000)
    return [_clean(d) for d in docs]


@api_router.get("/admin/stats")
async def admin_stats(admin: dict = Depends(get_current_admin)):
    docs = await db.registrations.find().to_list(2000)
    total_riders = len(docs)
    paid = [d for d in docs if d.get("payment_status") == "paid"]
    total_entries = sum(int(d.get("entries", 0)) for d in docs)
    revenue = sum(float(d.get("total", 0)) for d in paid)
    class_counts: dict = {}
    for d in docs:
        for c in d.get("classes", []):
            class_counts[c] = class_counts.get(c, 0) + 1
    return {
        "total_riders": total_riders,
        "paid_count": len(paid),
        "pending_count": total_riders - len(paid),
        "total_entries": total_entries,
        "revenue": revenue,
        "class_counts": class_counts,
    }


@api_router.patch("/admin/registrations/{reg_id}")
async def admin_update_registration(
    reg_id: str, body: RegistrationUpdate, admin: dict = Depends(get_current_admin)
):
    object_id = parse_object_id(reg_id, detail="Invalid registration identifier")
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.registrations.update_one({"_id": object_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Registration not found")
    doc = await db.registrations.find_one({"_id": object_id})
    detail = ", ".join(f"{k}={v}" for k, v in updates.items() if k != "updated_at")
    await log_admin_action(
        admin.get("email"), "registration.update", target=reg_id, detail=detail
    )
    return _clean(doc)


@api_router.delete("/admin/registrations/{reg_id}")
async def admin_delete_registration(
    reg_id: str, admin: dict = Depends(get_current_admin)
):
    object_id = parse_object_id(reg_id, detail="Invalid registration identifier")
    result = await db.registrations.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Registration not found")
    await log_admin_action(admin.get("email"), "registration.delete", target=reg_id)
    return {"message": "deleted"}


@api_router.get("/admin/contacts")
async def admin_list_contacts(admin: dict = Depends(get_current_admin)):
    docs = await db.contacts.find().sort("created_at", -1).to_list(1000)
    return [_clean(d) for d in docs]


@api_router.get("/admin/sponsor-inquiries")
async def admin_list_sponsor_inquiries(admin: dict = Depends(get_current_admin)):
    docs = await db.sponsor_inquiries.find().sort("created_at", -1).to_list(1000)
    return [_clean(d) for d in docs]


def _clean_user(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "email": doc.get("email"),
        "name": doc.get("name", "Admin"),
        "role": doc.get("role"),
        # Admins created before invites existed have no status field; treat as active.
        "status": doc.get("status", "active"),
        "created_at": doc.get("created_at"),
    }


@api_router.get("/admin/users")
async def admin_list_users(admin: dict = Depends(get_current_admin)):
    docs = await db.users.find({"role": "admin"}).sort("created_at", 1).to_list(1000)
    return [_clean_user(d) for d in docs]


@api_router.post("/admin/users", status_code=201)
async def admin_invite_user(
    body: AdminInviteCreate,
    background: BackgroundTasks,
    admin: dict = Depends(get_current_admin),
    _rate_limit: None = Depends(admin_account_limiter),
):
    email = body.email.lower()
    raw_token, token_hash, expires_at = generate_invite_token()
    doc = {
        "email": email,
        "name": body.name,
        "role": "admin",
        "status": "pending",
        "invite_token_hash": token_hash,
        "invite_expires_at": expires_at.isoformat(),
        "invited_by": admin.get("email"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        result = await db.users.insert_one(doc)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409, detail="An admin with that email already exists"
        )
    doc["_id"] = result.inserted_id
    background.add_task(_send_invite_email, email, body.name, admin.get("email"), raw_token)
    await log_admin_action(admin.get("email"), "admin.invite", target=email)
    return _clean_user(doc)


@api_router.post("/admin/users/{user_id}/resend-invite")
async def admin_resend_invite(
    user_id: str,
    background: BackgroundTasks,
    admin: dict = Depends(get_current_admin),
    _rate_limit: None = Depends(admin_account_limiter),
):
    object_id = parse_object_id(user_id, detail="Invalid user identifier")
    user = await db.users.find_one({"_id": object_id, "role": "admin"})
    if not user:
        raise HTTPException(status_code=404, detail="Admin user not found")
    if user.get("status") != "pending":
        raise HTTPException(status_code=400, detail="That admin has already accepted their invite")
    raw_token, token_hash, expires_at = generate_invite_token()
    await db.users.update_one(
        {"_id": object_id},
        {"$set": {"invite_token_hash": token_hash, "invite_expires_at": expires_at.isoformat()}},
    )
    background.add_task(
        _send_invite_email, user["email"], user.get("name", "Admin"), admin.get("email"), raw_token
    )
    await log_admin_action(admin.get("email"), "admin.resend_invite", target=user["email"])
    return {"message": "Invite resent"}


@api_router.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, admin: dict = Depends(get_current_admin)):
    object_id = parse_object_id(user_id, detail="Invalid user identifier")
    if str(object_id) == str(admin["_id"]):
        raise HTTPException(status_code=400, detail="You cannot remove your own account")
    active_admins = await db.users.count_documents(
        {"role": "admin", "status": {"$ne": "pending"}}
    )
    target = await db.users.find_one({"_id": object_id, "role": "admin"})
    if target and target.get("status", "active") != "pending" and active_admins <= 1:
        raise HTTPException(status_code=400, detail="Cannot remove the last admin")
    result = await db.users.delete_one({"_id": object_id, "role": "admin"})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Admin user not found")
    await log_admin_action(
        admin.get("email"), "admin.remove", target=target.get("email") if target else user_id
    )
    return {"message": "removed"}


def _clean_audit(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "actor_email": doc.get("actor_email"),
        "action": doc.get("action"),
        "target": doc.get("target"),
        "detail": doc.get("detail"),
        "created_at": doc.get("created_at"),
    }


@api_router.get("/admin/audit-log")
async def admin_audit_log(admin: dict = Depends(get_current_admin)):
    docs = await db.admin_actions.find().sort("created_at", -1).to_list(200)
    return [_clean_audit(d) for d in docs]


# ----------------------------------------------------------------------------
# Startup
# ----------------------------------------------------------------------------
def validate_configuration() -> None:
    jwt_secret = os.environ.get("JWT_SECRET", "")
    if len(jwt_secret.encode("utf-8")) < 32 or jwt_secret.lower() in {
        "secret",
        "changeme",
        "replace-with-a-long-random-secret",
    }:
        raise RuntimeError(
            "JWT_SECRET must be a unique random value of at least 32 bytes"
        )

    admin_email = os.environ.get("ADMIN_EMAIL", "").strip()
    admin_password = os.environ.get("ADMIN_PASSWORD", "")
    if not admin_email:
        raise RuntimeError("ADMIN_EMAIL is required")
    if len(admin_password) < 14 or admin_password.lower() in {"admin123", "password"}:
        raise RuntimeError(
            "ADMIN_PASSWORD must be a strong value of at least 14 characters"
        )
    if stripe.api_key and not STRIPE_WEBHOOK_SECRET:
        raise RuntimeError("STRIPE_WEBHOOK_SECRET is required when Stripe is enabled")


async def seed_admin():
    admin_email = os.environ["ADMIN_EMAIL"].strip().lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one(
            {
                "email": admin_email,
                "password_hash": hash_password(admin_password),
                "name": "Rodeo Admin",
                "role": "admin",
                "status": "active",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        logger.info("Seeded admin user %s", admin_email)
    elif existing.get("password_self_managed"):
        # Admin changed their password in-app; don't overwrite it from env.
        logger.info("Admin %s manages its own password; skipping env sync", admin_email)
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )
        logger.info("Updated admin password for %s", admin_email)


@app.on_event("startup")
async def on_startup():
    validate_configuration()
    await db.users.create_index("email", unique=True)
    await db.payment_transactions.create_index("session_id", unique=True, sparse=True)
    await db.registrations.create_index("created_at")
    await db.contacts.create_index("created_at")
    await db.sponsor_inquiries.create_index("created_at")
    await seed_admin()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Accept", "Content-Type", "X-Requested-With"],
)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)
app.add_middleware(
    CsrfOriginMiddleware,
    allowed_origins=allowed_origins,
    cookie_name=COOKIE_NAME,
)
app.add_middleware(RequestSizeLimitMiddleware, max_bytes=131_072)
app.add_middleware(SecurityHeadersMiddleware, production=IS_PRODUCTION)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# ----------------------------------------------------------------------------
# Static frontend (single-origin deploy: FastAPI serves the built React app)
# ----------------------------------------------------------------------------
_FRONTEND_BUILD = Path(
    os.environ.get("FRONTEND_BUILD_DIR", ROOT_DIR.parent / "frontend" / "build")
)

if _FRONTEND_BUILD.is_dir():
    _static_dir = _FRONTEND_BUILD / "static"
    if _static_dir.is_dir():
        app.mount("/static", StaticFiles(directory=str(_static_dir)), name="static")

    # Public images (e.g. /images/*.jpg from the CRA public/ folder). StaticFiles
    # resolves and confines paths within the directory, so this is traversal-safe.
    _images_dir = _FRONTEND_BUILD / "images"
    if _images_dir.is_dir():
        app.mount("/images", StaticFiles(directory=str(_images_dir)), name="images")

    # Root build artifacts are explicitly mapped so a request path is never used
    # to construct a filesystem path. All bundled assets live under /static.
    _public_build_filenames = [
        "asset-manifest.json",
        "favicon.ico",
        "favicon-16.png",
        "favicon-32.png",
        "favicon-48.png",
        "apple-touch-icon.png",
        "icon-192.png",
        "icon-512.png",
        "manifest.json",
        "og-image.jpg",
        "robots.txt",
        "sitemap.xml",
    ]
    _public_build_files = {name: _FRONTEND_BUILD / name for name in _public_build_filenames}

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # /api/* is handled by the router above; anything else falls back to the SPA.
        if full_path == "api" or full_path.startswith("api/"):
            return JSONResponse({"detail": "Not Found"}, status_code=404)
        public_file = _public_build_files.get(full_path)
        if public_file and public_file.is_file():
            return FileResponse(str(public_file))
        return FileResponse(str(_FRONTEND_BUILD / "index.html"))

else:
    logger.warning("Frontend build not found at %s; serving API only.", _FRONTEND_BUILD)
