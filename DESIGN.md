# MOTO Mayhem Rodeo Design System

## North Star

Build a digital race poster that moves. The experience should feel like a hand-screened motocross flyer pasted to a garage wall, then sharpened into a premium event site. It must be loud, physical, local, and unmistakably MOTO Mayhem without sacrificing the clarity parents need to register a rider.

## Brand character

- Fearless, kinetic, mischievous, welcoming, and community-built.
- Raw racing energy with deliberate information hierarchy.
- Authentic motocross culture, not generic esports, cyberpunk, or SaaS styling.
- Family event credibility underneath the mayhem: safety, schedule, class eligibility, price, and location must always read clearly.

## Visual language

### Surfaces

- Base canvas: near-black asphalt `#080A09`.
- Raised surface: oil-black `#111310`.
- Paper panel: dirty cream `#E7DE9D`, used sparingly for ticket-like information blocks.
- Add controlled film grain, dirt speckle, scuffed ink, torn-paper edges, and halftone dots.
- Use offset print layers and imperfect registration as a visual signature.
- Never use soft glass cards, generic gradients, glossy neon, or rounded SaaS panels.

### Racing accents

- Nitro yellow: `#E2D64A` — primary actions, price, key facts.
- Mayhem magenta: `#D81F63` — emotional emphasis, labels, offset shadows.
- Electric cyan: `#10AEB4` — navigational and informational accents.
- Burnout orange: `#F26A21` — secondary race markers and age/class emphasis.
- Chalk white: `#F4F1E8` — primary text.
- Keep accent fields flat and ink-like. Texture comes from overlays and masks, not gradients.

### Typography

- Display: `Anton`, condensed and uppercase for monumental event headlines.
- Brush accent: `Permanent Marker` for fast hand-painted words such as MAYHEM, RIDE, and OPEN.
- Technical/data: `Barlow Condensed`, uppercase, for times, classes, prices, labels, and navigation.
- Body: `Barlow`, for readable event descriptions and form copy.
- Headlines may overlap, rotate by 1–2 degrees, use rough clip paths, or carry a slightly misregistered ink shadow.
- Never sacrifice legibility for distress. Distress belongs on display type, not body copy.

## Graphic motifs

- Checkered flag strips used as section punctuation and progress markers.
- Lightning bolts, hand-drawn arrows, number plates, course cones, and starbursts.
- Torn tape labels for metadata and small calls to action.
- Oversized outlined words moving behind content as atmosphere.
- Rider cutouts can break container boundaries and overlap type.
- Use diagonal dividers and clipped corners to create velocity.

## Homepage composition

1. **Utility race strip:** registration deadline, event date, and Ione, California in a fast ticker.
2. **Hero poster:** full-bleed dirt-bike action, oversized stacked MOTO / MAYHEM / RODEO lettering, a high-contrast `$100 per rider` burst, and one dominant `Register to Ride` CTA.
3. **Race facts rail:** July 25, check-in at 9, ride at noon, Ed Hughes Memorial Arena, three events, custom shirt.
4. **Events:** three oversized editorial panels for Barrels, Poles, and Single Stake with number-plate styling.
5. **Classes:** dense but scannable race-board grid using cc, age group, and eligibility as the primary hierarchy.
6. **Safety + payout:** credibility section balancing gear requirements with prizes and the 110cc champion buckle.
7. **Sponsors:** community wall led by Gold's Bakery, using real logos when available and text marks otherwise.
8. **Final registration poster:** compressed recap, price, deadline, and a large mobile-friendly CTA.

## Components

### Buttons

- Rectangular or clipped-corner blocks; never pill buttons.
- Primary: nitro yellow fill, black label, magenta offset shadow.
- Secondary: transparent asphalt fill with chalk border and cyan hover.
- Use a hand-drawn arrow or racing-chevron cue at the trailing edge.
- Minimum touch target: 44px.

### Information panels

- Use hard 1–2px borders, clipped corners, and strong label/value separation.
- Metadata labels are cyan or magenta; values are chalk white or yellow.
- Avoid repeated identical card grids. Alternate horizontal rails, poster blocks, and editorial splits.

### Forms

- Preserve the race-poster identity while becoming calmer and more structured.
- Group fields into numbered checkpoints: class, rider, emergency contact, payment.
- Inputs use black surfaces, visible labels, strong focus rings, and generous touch spacing.
- Error states must be explicit in text and color.

## Motion

- Use fast 250–500ms reveal wipes, small parallax on rider cutouts, ticker motion, and subtle print-layer drift.
- Respect `prefers-reduced-motion`; all content must remain visible and usable with motion disabled.
- Avoid continuous heavy parallax, cursor gimmicks, and motion that delays registration.

## Accessibility and responsive rules

- Preserve AA contrast for body text and controls.
- Never put essential information only inside images.
- Desktop composition may overlap aggressively; mobile must reorder into a clean single-column poster.
- Mobile hero must expose event date, price, location, and primary CTA above the fold.
- Keyboard focus is highly visible in cyan and magenta.
- Images require meaningful alt text unless decorative.

## Content priorities

Always keep these facts accurate and easy to find:

- MOTO Mayhem Rodeo
- July 25, 2026
- Ed Hughes Memorial Arena, Ione, California
- Check-in at 9:00 AM; safety meeting at 10:00 AM; ride at noon
- $100 per rider/class entry
- Barrels, Pole Whipping, and Single Stake
- Custom T-shirt included
- Helmet and proper gear required
- Registration is the primary action
