"""Idempotent Stripe catalog setup for MOTO Mayhem Rodeo."""
import os
import stripe
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / ".env")
stripe.api_key = os.environ["STRIPE_SECRET_KEY"]

CATALOG = [
    {
        "emergent_product_id": "rider_entry",
        "name": "MOTO Mayhem Rodeo — Rider Entry",
        "tax_code": "txcd_99999999",
        "prices": [
            {"lookup_key": "rider_entry", "amount": 10000, "currency": "usd"},
        ],
    },
]


def ensure_tax_settings():
    s = stripe.tax.Settings.retrieve()
    if s.head_office and getattr(s.head_office, "address", None):
        return
    stripe.tax.Settings.modify(
        head_office={"address": {"country": "US", "line1": "Ed Hughes Memorial Arena", "city": "Ione", "state": "CA", "postal_code": "95640"}},
        defaults={"tax_behavior": "exclusive"},
    )


def get_or_create_product(entry):
    for p in stripe.Product.list(active=True).auto_paging_iter():
        if p.to_dict().get("metadata", {}).get("emergent_product_id") == entry["emergent_product_id"]:
            return p
    return stripe.Product.create(
        name=entry["name"],
        tax_code=entry.get("tax_code"),
        metadata={"managed_by": "emergent", "emergent_product_id": entry["emergent_product_id"]},
    )


def main():
    try:
        ensure_tax_settings()
        print("Tax settings ready")
    except Exception as e:
        print("Tax settings skipped:", e)
    for entry in CATALOG:
        product = get_or_create_product(entry)
        print("Product:", product.id, product.name)
        for p in entry["prices"]:
            existing = stripe.Price.list(lookup_keys=[p["lookup_key"]], active=True, limit=1).data
            if existing and (existing[0].unit_amount != p["amount"] or existing[0].currency != p["currency"]):
                stripe.Price.modify(existing[0].id, active=False)
                existing = []
            if not existing:
                price = stripe.Price.create(
                    product=product.id,
                    unit_amount=p["amount"],
                    currency=p["currency"],
                    lookup_key=p["lookup_key"],
                    transfer_lookup_key=True,
                )
                print("Created price:", price.id, p["lookup_key"])
            else:
                print("Price exists:", existing[0].id, p["lookup_key"])


if __name__ == "__main__":
    main()
