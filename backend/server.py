from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import logging
import bcrypt
import jwt
import stripe
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Annotated, Any

from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator, EmailStr
from bson import ObjectId

# ----------------------------------------------------------------------------
# Config / DB
# ----------------------------------------------------------------------------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY") or "sk_test_emergent"
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
JWT_ALGORITHM = "HS256"
ENTRY_PRICE = 100.0
TAX_MODE = "calc_only"  # Stripe Tax calculates at checkout

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI()
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
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=60), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=3600, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="none", max_age=604800, path="/")


async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user or user.get("role") != "admin":
            raise HTTPException(status_code=401, detail="Not authorized")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ----------------------------------------------------------------------------
# Models
# ----------------------------------------------------------------------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegistrationCreate(BaseModel):
    rider_name: str
    date_of_birth: str
    age: str
    tshirt_size: str
    classes: List[str]
    parent_guardian: Optional[str] = ""
    email: EmailStr
    phone: str
    emergency_name: str
    emergency_relationship: str
    emergency_phone: str
    payment_method: str  # "stripe" | "venmo_cash"


class CheckoutRequest(BaseModel):
    registration_id: str
    origin_url: str


class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    message: str


class RegistrationUpdate(BaseModel):
    payment_status: Optional[str] = None
    notes: Optional[str] = None


# ----------------------------------------------------------------------------
# Public routes
# ----------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"message": "MOTO Mayhem Rodeo API"}


@api_router.post("/auth/login")
async def login(body: LoginRequest, response: Response):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    uid = str(user["_id"])
    access = create_access_token(uid, email)
    refresh = create_refresh_token(uid)
    set_auth_cookies(response, access, refresh)
    return {"id": uid, "email": email, "name": user.get("name", "Admin"), "role": user.get("role"), "token": access}


@api_router.get("/auth/me")
async def me(admin: dict = Depends(get_current_admin)):
    return admin


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "logged out"}


@api_router.post("/registrations")
async def create_registration(body: RegistrationCreate):
    entries = len(body.classes)
    if entries < 1:
        raise HTTPException(status_code=400, detail="Select at least one class")
    doc = body.model_dump()
    doc.update({
        "entries": entries,
        "total": entries * ENTRY_PRICE,
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })
    result = await db.registrations.insert_one(doc)
    return {"id": str(result.inserted_id), "entries": entries, "total": entries * ENTRY_PRICE}


@api_router.post("/contact")
async def create_contact(body: ContactCreate):
    doc = body.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contacts.insert_one(doc)
    return {"message": "Message received. Ride hard!"}


# ----------------------------------------------------------------------------
# Payments (Stripe)
# ----------------------------------------------------------------------------
@api_router.post("/payments/checkout")
async def create_checkout(req: CheckoutRequest):
    reg = await db.registrations.find_one({"_id": ObjectId(req.registration_id)})
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")

    prices = stripe.Price.list(lookup_keys=["rider_entry"], active=True, limit=1).data
    if not prices:
        raise HTTPException(status_code=500, detail="Price not configured. Run setup_stripe.py")
    price = prices[0]
    quantity = int(reg.get("entries", 1))

    kwargs = dict(
        line_items=[{"price": price.id, "quantity": quantity}],
        mode="payment",
        success_url=f"{req.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{req.origin_url}/register",
        metadata={"registration_id": req.registration_id, "rider_name": reg.get("rider_name", "")},
    )
    if TAX_MODE == "calc_only":
        session = stripe.checkout.Session.create(**kwargs, automatic_tax={"enabled": True}, billing_address_collection="required")
    else:
        session = stripe.checkout.Session.create(**kwargs)

    await db.payment_transactions.insert_one({
        "session_id": session.id,
        "registration_id": req.registration_id,
        "amount": (price.unit_amount or 0) / 100 * quantity,
        "currency": price.currency,
        "status": "initiated",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"checkout_url": session.url, "session_id": session.id}


async def _mark_paid(session_id: str, payment_intent=None):
    now = datetime.now(timezone.utc).isoformat()
    txn = await db.payment_transactions.find_one_and_update(
        {"session_id": session_id, "payment_status": {"$ne": "paid"}},
        {"$set": {"status": "completed", "payment_status": "paid", "stripe_payment_intent_id": payment_intent, "updated_at": now}},
    )
    if txn and txn.get("registration_id"):
        await db.registrations.update_one(
            {"_id": ObjectId(txn["registration_id"])},
            {"$set": {"payment_status": "paid", "updated_at": now}},
        )


@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str):
    record = await db.payment_transactions.find_one({"session_id": session_id})
    if not record:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if record.get("payment_status") != "paid":
        try:
            s = stripe.checkout.Session.retrieve(session_id)
            if s.payment_status == "paid" or s.status == "complete":
                await _mark_paid(session_id, s.payment_intent)
                record = await db.payment_transactions.find_one({"session_id": session_id})
        except stripe.error.StripeError:
            pass
    return {"session_id": record["session_id"], "status": record["status"], "payment_status": record["payment_status"]}


@api_router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    obj, t = event["data"]["object"], event["type"]
    if t == "checkout.session.completed":
        await _mark_paid(obj["id"], obj.get("payment_intent"))
    elif t == "checkout.session.async_payment_succeeded":
        await _mark_paid(obj["id"], obj.get("payment_intent"))
    elif t in ("checkout.session.async_payment_failed", "checkout.session.expired"):
        await db.payment_transactions.update_one(
            {"session_id": obj["id"]},
            {"$set": {"status": "failed", "payment_status": "failed", "updated_at": datetime.now(timezone.utc).isoformat()}},
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
async def admin_update_registration(reg_id: str, body: RegistrationUpdate, admin: dict = Depends(get_current_admin)):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.registrations.update_one({"_id": ObjectId(reg_id)}, {"$set": updates})
    doc = await db.registrations.find_one({"_id": ObjectId(reg_id)})
    return _clean(doc)


@api_router.delete("/admin/registrations/{reg_id}")
async def admin_delete_registration(reg_id: str, admin: dict = Depends(get_current_admin)):
    await db.registrations.delete_one({"_id": ObjectId(reg_id)})
    return {"message": "deleted"}


@api_router.get("/admin/contacts")
async def admin_list_contacts(admin: dict = Depends(get_current_admin)):
    docs = await db.contacts.find().sort("created_at", -1).to_list(1000)
    return [_clean(d) for d in docs]


# ----------------------------------------------------------------------------
# Startup
# ----------------------------------------------------------------------------
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@motomayhem.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Rodeo Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded admin user %s", admin_email)
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Updated admin password for %s", admin_email)


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await seed_admin()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000"), "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# ----------------------------------------------------------------------------
# Static frontend (single-origin deploy: FastAPI serves the built React app)
# ----------------------------------------------------------------------------
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

_FRONTEND_BUILD = Path(
    os.environ.get("FRONTEND_BUILD_DIR", ROOT_DIR.parent / "frontend" / "build")
)

if _FRONTEND_BUILD.is_dir():
    _static_dir = _FRONTEND_BUILD / "static"
    if _static_dir.is_dir():
        app.mount("/static", StaticFiles(directory=str(_static_dir)), name="static")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # /api/* is handled by the router above; anything else falls back to the SPA.
        if full_path.startswith("api"):
            return JSONResponse({"detail": "Not Found"}, status_code=404)
        candidate = _FRONTEND_BUILD / full_path
        if full_path and candidate.is_file():
            return FileResponse(str(candidate))
        return FileResponse(str(_FRONTEND_BUILD / "index.html"))
else:
    logger.warning("Frontend build not found at %s; serving API only.", _FRONTEND_BUILD)
