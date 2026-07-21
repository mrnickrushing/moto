import unittest

from security import build_csp, normalized_origins, safe_public_url, scrub_sentry_event


class SecurityHelpersTest(unittest.TestCase):
    def test_production_csp_blocks_frames_objects_and_mixed_content(self):
        policy = build_csp(production=True)
        self.assertIn("frame-ancestors 'none'", policy)
        self.assertIn("object-src 'none'", policy)
        self.assertIn("upgrade-insecure-requests", policy)

    def test_origins_are_normalized_and_invalid_values_rejected(self):
        self.assertEqual(
            normalized_origins(["https://moto.example/path", "http://localhost:3000"]),
            {"https://moto.example", "http://localhost:3000"},
        )
        with self.assertRaises(ValueError):
            normalized_origins(["javascript:alert(1)"])

    def test_payment_identifier_and_query_are_redacted(self):
        result = safe_public_url(
            "https://moto.example/api/payments/status/cs_test_secret?email=rider@example.com"
        )
        self.assertEqual(
            result,
            "https://moto.example/api/payments/status/[redacted]",
        )

    def test_sentry_event_drops_request_pii(self):
        event = {
            "user": {"email": "rider@example.com"},
            "request": {
                "url": "https://moto.example/api/contact?email=rider@example.com",
                "headers": {"authorization": "secret"},
                "cookies": {"moto_admin": "secret"},
                "data": {"password": "secret"},
            },
        }
        scrubbed = scrub_sentry_event(event)
        self.assertNotIn("user", scrubbed)
        self.assertEqual(
            scrubbed["request"], {"url": "https://moto.example/api/contact"}
        )


if __name__ == "__main__":
    unittest.main()
