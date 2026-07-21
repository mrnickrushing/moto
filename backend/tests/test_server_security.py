import os
import unittest
from unittest.mock import patch

from pydantic import ValidationError
from starlette.responses import Response

os.environ.setdefault("MONGO_URL", "mongodb://127.0.0.1:27017")
os.environ.setdefault("DB_NAME", "moto_security_test")
os.environ.setdefault(
    "JWT_SECRET", "unit-test-secret-that-is-longer-than-thirty-two-bytes"
)
os.environ.setdefault("ADMIN_EMAIL", "admin@example.com")
os.environ.setdefault("ADMIN_PASSWORD", "unit-test-admin-password")
os.environ.setdefault("FRONTEND_URL", "http://localhost:3000")

from server import (  # noqa: E402
    RegistrationCreate,
    create_access_token,
    set_auth_cookie,
    validate_configuration,
)


def valid_registration():
    return {
        "rider_name": "Test Rider",
        "date_of_birth": "2010-05-01",
        "age": 15,
        "tshirt_size": "Adult M",
        "classes": ["TEEN Teen Class (13–17 yrs)"],
        "parent_guardian": "Test Parent",
        "email": "rider@example.com",
        "phone": "555-111-2222",
        "emergency_name": "Emergency Contact",
        "emergency_relationship": "Parent",
        "emergency_phone": "555-333-4444",
        "payment_method": "venmo_cash",
    }


class ServerSecurityTest(unittest.TestCase):
    def test_registration_rejects_tampered_class(self):
        payload = valid_registration()
        payload["classes"] = ["Unlimited Free Entries"]
        with self.assertRaises(ValidationError):
            RegistrationCreate(**payload)

    def test_registration_rejects_age_mismatch(self):
        payload = valid_registration()
        payload["age"] = 18
        with self.assertRaises(ValidationError):
            RegistrationCreate(**payload)

    def test_configuration_rejects_weak_jwt_secret(self):
        with patch.dict(os.environ, {"JWT_SECRET": "secret"}):
            with self.assertRaises(RuntimeError):
                validate_configuration()

    def test_auth_cookie_is_http_only_and_same_site(self):
        token = create_access_token("507f1f77bcf86cd799439011", "admin@example.com")
        response = Response()
        set_auth_cookie(response, token)
        cookie = response.headers["set-cookie"].lower()
        self.assertIn("httponly", cookie)
        self.assertIn("samesite=lax", cookie)
        self.assertNotIn("domain=", cookie)


if __name__ == "__main__":
    unittest.main()
