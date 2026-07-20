# MOTO Mayhem Rodeo — PRD

## Original Problem Statement
"Come up with a mock website for this moto business." Source: flyers for MOTO Mayhem Rodeo — a kids/teens/adults dirt-bike rodeo event at Ed Hughes Memorial Arena, Ione CA, July 25 2026. Tagline "Ride Hard · Cause Mayhem · Have Fun". $100/rider = 3 events (Barrels, Pole Whipping, Single Stake) + custom t-shirt. Cash payout + champion buckle (110cc). Sponsor: Gold's Bakery.

## User Choices
- Site + rider registration + admin dashboard
- Live countdown timer to July 25 2026
- Stripe online payment AND Venmo/Cash info
- Pages: Home, Event, Classes, Sponsors, Register, Contact
- Graffiti-grunge flyer aesthetic (black / gold / hot-pink / teal)

## Architecture
- Frontend: React 19 + Tailwind, framer-motion, Lenis smooth scroll, react-fast-marquee, sonner. Fonts: Anton / JetBrains Mono / Manrope.
- Backend: FastAPI + MongoDB (motor). JWT admin auth (httpOnly cookies), bcrypt.
- Stripe: claimable sandbox (test mode), price lookup_key `rider_entry` ($100), tax mode = Stripe-calculates-only (automatic_tax).

## User Personas
- Rider/Parent: browses event info, picks class(es), registers + pays.
- Admin/Organizer: logs in to view/manage registrations, revenue, mark paid, delete.

## Core Requirements (static)
- Marketing site matching brand vibe; countdown; classes & schedule; sponsors.
- Registration -> Stripe checkout OR Venmo/Cash reservation.
- Protected admin dashboard with stats + registration CRUD.

## Implemented (2026-07-20)
- All 6 public pages + payment success + 404, kinetic hero (masked reveal, parallax), countdown, manifesto chapters, marquee, flyer gallery.
- Backend: /api/registrations, /api/payments/checkout + status + webhook, /api/contact, /api/auth/*, /api/admin/* (registrations, stats, patch, delete, contacts). Admin seeded from env.
- Admin dashboard: stats cards, registrations table, toggle-paid, delete, logout.
- Tested: backend 18/18 pytest pass; frontend E2E all flows pass.

## Backlog
- P1: Email confirmation to rider on registration (Resend), CSV export of registrations.
- P2: Per-class capacity limits, results/leaderboard page, photo gallery post-event.
- P2: Sponsor logo uploads via object storage.

## Next Tasks
- Optional: Resend confirmation emails; CSV export from admin.
