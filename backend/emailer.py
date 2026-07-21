"""Transactional email for MOTO Mayhem Rodeo.

Provider-agnostic and configuration-driven:
  * If RESEND_API_KEY is set  -> send via the Resend HTTP API.
  * Else if SMTP_HOST is set   -> send via SMTP (e.g. Yahoo app password).
  * Else                       -> log and no-op (feature stays dormant, forms
                                  still work) so the app runs fine before mail
                                  is configured.

Sending never raises into the request path — failures are logged (and reported
to Sentry if configured) so a mail problem can't fail a registration.
"""
from __future__ import annotations

import logging
import os
import smtplib
import ssl
from email.message import EmailMessage
from email.utils import formataddr
from typing import Iterable

import anyio

logger = logging.getLogger(__name__)

# ----------------------------------------------------------------------------
# Config (all optional; read at call time so env changes need only a restart)
# ----------------------------------------------------------------------------
EVENT_NAME = "MOTO Mayhem Rodeo"
EVENT_DATE = os.environ.get("EVENT_DATE", "July 25, 2026")
EVENT_VENUE = os.environ.get("EVENT_VENUE", "Ed Hughes Memorial Arena, Ione, CA")
EVENT_SCHEDULE = "Check-in 9:00 AM · Safety meeting · Ride at Noon"


def _cfg(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def organizer_email() -> str:
    return _cfg("ORGANIZER_EMAIL", "MotoMayhemRodeo@yahoo.com")


def site_url() -> str:
    return _cfg("FRONTEND_URL", "https://moto.rushingtechnologies.com").rstrip("/")


def mail_from() -> str:
    # e.g. "MOTO Mayhem Rodeo <moto@rushingtechnologies.com>"
    return _cfg("MAIL_FROM")


def email_enabled() -> bool:
    if not mail_from():
        return False
    return bool(_cfg("RESEND_API_KEY") or _cfg("SMTP_HOST"))


# ----------------------------------------------------------------------------
# Sending
# ----------------------------------------------------------------------------
async def send_email(
    to: str | Iterable[str],
    subject: str,
    html: str,
    *,
    reply_to: str | None = None,
) -> bool:
    """Send one email. Returns True if handed off to a provider, else False."""
    recipients = [to] if isinstance(to, str) else [r for r in to if r]
    recipients = list(dict.fromkeys(r.strip() for r in recipients if r and r.strip()))
    if not recipients:
        return False
    if not email_enabled():
        logger.info("Email not configured; skipping %r to %s", subject, recipients)
        return False
    try:
        if _cfg("RESEND_API_KEY"):
            await _send_resend(recipients, subject, html, reply_to)
        else:
            await anyio.to_thread.run_sync(
                _send_smtp, recipients, subject, html, reply_to
            )
        logger.info("Sent email %r to %s", subject, recipients)
        return True
    except Exception:  # noqa: BLE001 - never let mail break the request
        logger.exception("Failed to send email %r to %s", subject, recipients)
        return False


async def _send_resend(
    recipients: list[str], subject: str, html: str, reply_to: str | None
) -> None:
    import httpx

    payload: dict = {
        "from": mail_from(),
        "to": recipients,
        "subject": subject,
        "html": html,
    }
    if reply_to:
        payload["reply_to"] = reply_to
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {_cfg('RESEND_API_KEY')}"},
            json=payload,
        )
        resp.raise_for_status()


def _send_smtp(
    recipients: list[str], subject: str, html: str, reply_to: str | None
) -> None:
    host = _cfg("SMTP_HOST")
    port = int(_cfg("SMTP_PORT", "587") or "587")
    user = _cfg("SMTP_USER")
    password = _cfg("SMTP_PASSWORD")

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = mail_from()
    msg["To"] = ", ".join(recipients)
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.set_content(
        "This email is best viewed in an HTML-capable client.\n"
        f"{EVENT_NAME} — {EVENT_DATE} — {EVENT_VENUE}"
    )
    msg.add_alternative(html, subtype="html")

    context = ssl.create_default_context()
    if port == 465:
        with smtplib.SMTP_SSL(host, port, context=context, timeout=20) as server:
            if user:
                server.login(user, password)
            server.send_message(msg)
    else:
        with smtplib.SMTP(host, port, timeout=20) as server:
            server.starttls(context=context)
            if user:
                server.login(user, password)
            server.send_message(msg)


# ----------------------------------------------------------------------------
# Themed HTML templates (table-based + inline styles for email clients)
# ----------------------------------------------------------------------------
_BG = "#0b0b0b"
_PANEL = "#141414"
_BORDER = "#2a2d28"
_YELLOW = "#e2d64a"
_PINK = "#d81f63"
_CYAN = "#10aeb4"
_TEXT = "#ededed"
_MUTED = "#9a9a9a"
_FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif"


def _esc(value) -> str:
    text = "" if value is None else str(value)
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def _wordmark() -> str:
    return (
        f'<span style="color:{_YELLOW};">MOTO</span> '
        f'<span style="color:#ffffff;">MAYHEM</span> '
        f'<span style="color:{_CYAN};">RODEO</span>'
    )


def _rows(pairs: list[tuple[str, str]]) -> str:
    out = []
    for label, value in pairs:
        if value in (None, "", []):
            continue
        out.append(
            f'<tr>'
            f'<td style="padding:8px 0;color:{_MUTED};font-size:12px;'
            f'text-transform:uppercase;letter-spacing:1.5px;width:42%;'
            f'vertical-align:top;font-family:{_FONT};">{_esc(label)}</td>'
            f'<td style="padding:8px 0;color:{_TEXT};font-size:15px;font-weight:bold;'
            f'vertical-align:top;font-family:{_FONT};">{_esc(value)}</td>'
            f'</tr>'
        )
    return "".join(out)


def layout(preheader: str, accent: str, heading: str, body_html: str) -> str:
    return f"""<!doctype html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark light"></head>
<body style="margin:0;padding:0;background:{_BG};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">{_esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{_BG};padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:{_PANEL};border:2px solid {_BORDER};">
  <tr><td style="height:6px;background:{accent};font-size:0;line-height:0;">&nbsp;</td></tr>
  <tr><td style="padding:26px 32px 6px 32px;font-family:{_FONT};font-size:22px;font-weight:800;letter-spacing:1px;">
    {_wordmark()}
  </td></tr>
  <tr><td style="padding:0 32px;">
    <div style="height:2px;background:{_BORDER};"></div>
  </td></tr>
  <tr><td style="padding:24px 32px 4px 32px;">
    <h1 style="margin:0;color:#ffffff;font-family:{_FONT};font-size:30px;line-height:1.05;
      text-transform:uppercase;letter-spacing:0.5px;">{heading}</h1>
  </td></tr>
  <tr><td style="padding:12px 32px 28px 32px;font-family:{_FONT};color:{_TEXT};font-size:15px;line-height:1.6;">
    {body_html}
  </td></tr>
  <tr><td style="padding:0 32px;"><div style="height:2px;background:{_BORDER};"></div></td></tr>
  <tr><td style="padding:18px 32px 26px 32px;font-family:{_FONT};color:{_MUTED};font-size:12px;line-height:1.7;">
    <strong style="color:{_TEXT};">{EVENT_NAME}</strong><br>
    {_esc(EVENT_DATE)} &middot; {_esc(EVENT_VENUE)}<br>
    {_esc(EVENT_SCHEDULE)}<br>
    <a href="{site_url()}" style="color:{_CYAN};text-decoration:none;">{_esc(site_url())}</a>
  </td></tr>
</table>
</td></tr></table></body></html>"""


def _button(href: str, label: str) -> str:
    return (
        f'<a href="{href}" style="display:inline-block;background:{_YELLOW};color:#000000;'
        f'font-family:{_FONT};font-weight:800;text-transform:uppercase;letter-spacing:1px;'
        f'font-size:14px;padding:14px 26px;text-decoration:none;">{_esc(label)}</a>'
    )


# ---- Registration ----------------------------------------------------------
def registration_rider_email(reg: dict) -> tuple[str, str]:
    classes = reg.get("classes") or []
    classes_html = "".join(
        f'<li style="margin:2px 0;">{_esc(c)}</li>' for c in classes
    )
    total = reg.get("total", 0)
    cash = reg.get("payment_method") == "venmo_cash"
    total_row = (
        f"${total:.0f} — Venmo or cash at check-in" if cash else f"${total:.0f}"
    )
    pay_note = (
        f"Bring your ${total:.0f} entry as Venmo or cash on race day. " if cash else ""
    )
    body = f"""
      <p style="margin:0 0 16px 0;">Hey {_esc(reg.get('rider_name', 'rider'))}, your spot is locked in.
      We can't wait to see you throw down at {EVENT_NAME}.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
        style="margin:8px 0 18px 0;border-top:2px solid {_BORDER};border-bottom:2px solid {_BORDER};">
        {_rows([
            ("Rider", reg.get("rider_name")),
            ("Entries", f"{len(classes)} class{'es' if len(classes) != 1 else ''}"),
            ("Total", total_row),
        ])}
      </table>
      <p style="margin:0 0 6px 0;color:{_MUTED};font-size:12px;text-transform:uppercase;letter-spacing:1.5px;">Your classes</p>
      <ul style="margin:0 0 20px 18px;padding:0;color:{_TEXT};">{classes_html}</ul>
      <p style="margin:0 0 22px 0;color:{_MUTED};">{pay_note}All riders must wear a helmet and proper gear.
      See you at the gate!</p>
      {_button(site_url() + "/event", "Event Details")}
    """
    subject = f"You're in! {EVENT_NAME} registration confirmed"
    return subject, layout("Your race registration is confirmed.", _YELLOW, "Spot Reserved", body)


def registration_organizer_email(reg: dict) -> tuple[str, str]:
    classes = reg.get("classes") or []
    body = f"""
      <p style="margin:0 0 16px 0;">New rider registration just came in.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
        style="margin:8px 0 18px 0;border-top:2px solid {_BORDER};border-bottom:2px solid {_BORDER};">
        {_rows([
            ("Rider", reg.get("rider_name")),
            ("Date of Birth", reg.get("date_of_birth")),
            ("Age", reg.get("age")),
            ("T-Shirt", reg.get("tshirt_size")),
            ("Parent/Guardian", reg.get("parent_guardian")),
            ("Email", reg.get("email")),
            ("Phone", reg.get("phone")),
            ("Emergency", f"{reg.get('emergency_name','')} ({reg.get('emergency_relationship','')}) {reg.get('emergency_phone','')}"),
            ("Classes", ", ".join(classes)),
            ("Entries", len(classes)),
            ("Total", f"${reg.get('total', 0):.0f}"),
            ("Payment", reg.get("payment_method")),
        ])}
      </table>
      {_button(site_url() + "/admin", "Open Admin Dashboard")}
    """
    subject = f"New registration — {reg.get('rider_name', 'rider')} ({len(classes)} entries)"
    return subject, layout("New rider registration.", _CYAN, "New Registration", body)


# ---- Sponsor ---------------------------------------------------------------
def sponsor_applicant_email(inq: dict) -> tuple[str, str]:
    body = f"""
      <p style="margin:0 0 16px 0;">Thank you, {_esc(inq.get('contact_name', 'partner'))}! We got
      {_esc(inq.get('business_name', 'your business'))}'s interest in backing {EVENT_NAME} and we'll
      be in touch shortly to lock in the details.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
        style="margin:8px 0 18px 0;border-top:2px solid {_BORDER};border-bottom:2px solid {_BORDER};">
        {_rows([
            ("Business", inq.get("business_name")),
            ("Contact", inq.get("contact_name")),
            ("Interested Tier", inq.get("tier")),
        ])}
      </table>
      <p style="margin:0 0 22px 0;color:{_MUTED};">Sponsors give young riders the chance to compete for a
      championship buckle — thank you for supporting the riding community.</p>
      {_button(site_url() + "/sponsors", "See Our Sponsors")}
    """
    subject = f"Thanks for backing {EVENT_NAME}!"
    return subject, layout("We received your sponsorship interest.", _PINK, "You're On The Board", body)


def sponsor_organizer_email(inq: dict) -> tuple[str, str]:
    body = f"""
      <p style="margin:0 0 16px 0;">New sponsor inquiry just came in.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
        style="margin:8px 0 18px 0;border-top:2px solid {_BORDER};border-bottom:2px solid {_BORDER};">
        {_rows([
            ("Business", inq.get("business_name")),
            ("Contact", inq.get("contact_name")),
            ("Email", inq.get("email")),
            ("Phone", inq.get("phone")),
            ("Interested Tier", inq.get("tier")),
            ("Message", inq.get("message")),
        ])}
      </table>
      {_button(site_url() + "/admin", "Open Admin Dashboard")}
    """
    subject = f"New sponsor inquiry — {inq.get('business_name', 'business')}"
    return subject, layout("New sponsor inquiry.", _CYAN, "New Sponsor Inquiry", body)
