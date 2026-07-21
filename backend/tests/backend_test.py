"""Backend API tests for MOTO Mayhem Rodeo."""
import os
import pytest
import requests

BASE_URL = os.environ.get("MOTO_TEST_BASE_URL", "").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = os.environ.get("MOTO_TEST_ADMIN_EMAIL", "")
ADMIN_PASSWORD = os.environ.get("MOTO_TEST_ADMIN_PASSWORD", "")

pytestmark = pytest.mark.skipif(
    not (BASE_URL and ADMIN_EMAIL and ADMIN_PASSWORD),
    reason="Set MOTO_TEST_BASE_URL and test-only admin credentials to run live API tests",
)


@pytest.fixture(scope="session")
def s():
    session = requests.Session()
    session.headers["Origin"] = BASE_URL
    return session


@pytest.fixture(scope="session")
def admin_session():
    sess = requests.Session()
    sess.headers["Origin"] = BASE_URL
    r = sess.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return sess


# ---------- Health / Root ----------
def test_root(s):
    r = s.get(f"{API}/", timeout=15)
    assert r.status_code == 200
    assert "MOTO" in r.json().get("message", "")


# ---------- Auth ----------
class TestAuth:
    def test_login_success_sets_cookies(self):
        sess = requests.Session()
        sess.headers["Origin"] = BASE_URL
        r = sess.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        assert "token" not in data
        assert any(cookie.name.endswith("moto_admin") for cookie in sess.cookies)

    def test_login_invalid(self, s):
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_me_with_cookie(self, admin_session):
        r = admin_session.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_me_unauthenticated(self):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_logout(self):
        sess = requests.Session()
        sess.headers["Origin"] = BASE_URL
        sess.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        r = sess.post(f"{API}/auth/logout", timeout=15)
        assert r.status_code == 200


# ---------- Registrations ----------
def _reg_payload(classes=None, payment_method="venmo_cash"):
    if classes is None:
        classes = ["50cc Pee-Wee (4–6 yrs)"]
    return {
        "rider_name": "TEST_Rider",
        "date_of_birth": "2010-05-01",
        "age": "15",
        "tshirt_size": "Adult M",
        "classes": classes,
        "parent_guardian": "TEST_Parent",
        "email": "test_rider@example.com",
        "phone": "555-111-2222",
        "emergency_name": "TEST_EC",
        "emergency_relationship": "Parent",
        "emergency_phone": "555-333-4444",
        "payment_method": payment_method,
    }


class TestRegistrations:
    def test_create_registration_single_class(self, s):
        r = s.post(f"{API}/registrations", json=_reg_payload(), timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["entries"] == 1
        assert d["total"] == 100.0
        assert "id" in d

    def test_create_registration_multi_class(self, s):
        payload = _reg_payload(classes=[
            "50cc Pee-Wee (4–6 yrs)",
            "65cc Class B (10–12 yrs)",
            "TEEN Teen Class (13–17 yrs)",
        ])
        r = s.post(f"{API}/registrations", json=payload, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["entries"] == 3
        assert d["total"] == 300.0

    def test_create_registration_no_classes(self, s):
        payload = _reg_payload(classes=[])
        r = s.post(f"{API}/registrations", json=payload, timeout=15)
        assert r.status_code == 422


# ---------- Payments ----------
class TestPayments:
    def test_checkout_creates_stripe_session(self, s):
        reg = s.post(f"{API}/registrations", json=_reg_payload(), timeout=15).json()
        r = s.post(f"{API}/payments/checkout", json={"registration_id": reg["id"]}, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("session_id", "").startswith("cs_")
        assert "checkout.stripe.com" in d.get("checkout_url", "") or "stripe.com" in d.get("checkout_url", "")
        # verify status endpoint
        st = s.get(f"{API}/payments/status/{d['session_id']}", timeout=15)
        assert st.status_code == 200
        sd = st.json()
        assert sd["session_id"] == d["session_id"]
        assert "payment_status" in sd
        assert "status" in sd

    def test_checkout_bad_registration(self, s):
        r = s.post(f"{API}/payments/checkout", json={"registration_id": "507f1f77bcf86cd799439011"}, timeout=15)
        assert r.status_code == 404


# ---------- Contact ----------
class TestContact:
    def test_contact_create(self, s):
        r = s.post(f"{API}/contact", json={"name": "TEST_John", "email": "test_john@example.com", "message": "TEST message"}, timeout=15)
        assert r.status_code == 200


# ---------- Admin protected ----------
class TestAdmin:
    def test_registrations_unauth(self):
        r = requests.get(f"{API}/admin/registrations", timeout=15)
        assert r.status_code == 401

    def test_stats_unauth(self):
        r = requests.get(f"{API}/admin/stats", timeout=15)
        assert r.status_code == 401

    def test_admin_list_registrations(self, admin_session):
        r = admin_session.get(f"{API}/admin/registrations", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_stats(self, admin_session):
        r = admin_session.get(f"{API}/admin/stats", timeout=15)
        assert r.status_code == 200
        d = r.json()
        for k in ["total_riders", "paid_count", "pending_count", "total_entries", "revenue", "class_counts"]:
            assert k in d

    def test_admin_patch_and_delete(self, admin_session):
        # create fresh registration
        reg = requests.post(f"{API}/registrations", json=_reg_payload(), timeout=15).json()
        rid = reg["id"]
        r = admin_session.patch(f"{API}/admin/registrations/{rid}", json={"payment_status": "paid"}, timeout=15)
        assert r.status_code == 200
        assert r.json()["payment_status"] == "paid"
        # delete
        r = admin_session.delete(f"{API}/admin/registrations/{rid}", timeout=15)
        assert r.status_code == 200

    def test_delete_unauth(self):
        r = requests.delete(f"{API}/admin/registrations/507f1f77bcf86cd799439011", timeout=15)
        assert r.status_code == 401
