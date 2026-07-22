export const EVENT = {
  name: "MOTO Mayhem Rodeo",
  tagline: "Ride Hard • Cause Mayhem • Have Fun",
  location: "Ed Hughes Memorial Arena",
  city: "Ione, CA",
  date: "July 25, 2026",
  dateISO: "2026-07-25T09:00:00-07:00",
  price: 100,
  email: "MotoMayhemRodeo@yahoo.com",
  regDeadline: "July 13, 2026",
  facebook: "https://www.facebook.com/profile.php?id=61590379212637",
};

export const SCHEDULE = [
  { time: "9:00 AM", label: "Check In", note: "Bike & gear check booth open" },
  { time: "10:00 AM", label: "Safety Meeting", note: "All riders must attend" },
  { time: "10:30 AM", label: "Warm-Up", note: "Get loose, learn the course" },
  { time: "12:00 PM", label: "Ride", note: "Mayhem begins" },
];

export const EVENTS = [
  {
    num: "01",
    name: "Barrels",
    desc: "Weave the drums, hold your line, and pin it on the straight. Precision at speed.",
    accent: "yellow",
  },
  {
    num: "02",
    name: "Pole Whipping",
    desc: "Cut it tight around the poles. Every tenth counts. Loose brings the whip.",
    accent: "pink",
  },
  {
    num: "03",
    name: "Single Stake",
    desc: "One stake. One line. Rail it and get gone. The purest test of throttle control.",
    accent: "cyan",
  },
];

export const CLASSES = [
  { id: "50cc-peewee", cc: "50cc", label: "Pee-Wee", age: "4–6 yrs", note: "Parent must be present in arena", accent: "yellow" },
  { id: "50cc-78", cc: "50cc", label: "Junior", age: "7–8 yrs", note: "", accent: "yellow" },
  { id: "65cc-79", cc: "65cc", label: "Class A", age: "7–9 yrs", note: "", accent: "cyan" },
  { id: "65cc-1012", cc: "65cc", label: "Class B", age: "10–12 yrs", note: "", accent: "cyan" },
  { id: "85cc-810", cc: "85cc", label: "Class A", age: "8–10 yrs", note: "", accent: "pink" },
  { id: "85cc-1112", cc: "85cc", label: "Class B", age: "11–12 yrs", note: "", accent: "pink" },
  { id: "110cc-open", cc: "110cc", label: "Open", age: "12 & Under", note: "Cash payout + champion buckle", accent: "yellow" },
  { id: "teen", cc: "TEEN", label: "Teen Class", age: "13–17 yrs", note: "Bike size 110 & under", accent: "cyan" },
  { id: "adult", cc: "ADULT", label: "Adult Class", age: "18 & Over", note: "Cash payout for first place", accent: "pink" },
];

export const TSHIRT_SIZES = ["YXS", "YS", "YM", "YL", "Adult S", "Adult M", "Adult L", "Adult XL"];

// To add a sponsor logo: drop the image in `frontend/public/images/sponsors/`
// and set that sponsor's `logo` to e.g. "/images/sponsors/golds-bakery.png".
// Leave `logo` empty to keep the current text-only card.
export const SPONSORS = [
  {
    id: "golds-bakery",
    name: "Gold's Bakery",
    tier: "Champion Buckle Sponsor",
    accent: "yellow",
    note: "110cc 12 & Under Champion Buckle",
    category: "Bakery",
    location: "Ione, CA",
    website: "https://www.goldsbakery.com",
    logo: "/images/sponsors/golds-bakery.webp",
    teaser: "Hometown Ione bakery putting up the 110cc Champion Buckle.",
    blurb:
      "A hometown bakery on Main Street in Ione, baking fresh sourdough, cinnamon rolls, cookies and seasonal treats for all of Amador County. Gold's Bakery steps up as our Champion Buckle Sponsor — putting up the buckle for the 110cc 12 & Under class champion. Find them at (209) 790-9551 or goldsbakery.ioneca@gmail.com.",
  },
  {
    id: "solomon-livestock",
    name: "Solomon Livestock",
    tier: "Champion Buckle Sponsor",
    accent: "cyan",
    note: "50cc Ages 7–8 Championship Buckle",
    category: "Livestock",
    location: "Amador County, CA",
    website: "",
    logo: "/images/sponsors/solomon-livestock.webp",
    teaser: "Backing the 50cc Ages 7–8 Championship Buckle.",
    blurb:
      "A local livestock outfit investing in the youth and moto-western community of Amador County. Solomon Livestock puts up the championship buckle for the 50cc Ages 7–8 class, giving the youngest riders something to chase.",
  },
  {
    id: "milovina-construction",
    name: "Milovina Construction",
    tier: "Champion Buckle Sponsor",
    accent: "pink",
    note: "65cc Ages 7–9 Champion Buckle",
    category: "Construction",
    location: "Amador County, CA",
    website: "",
    logo: "/images/sponsors/milovina-construction.webp",
    teaser: "Building more than projects — backing the 65cc Ages 7–9 Buckle.",
    blurb:
      "A local construction outfit putting up the 65cc Ages 7–9 Champion Buckle. Milovina Construction is also behind the scenes of Moto Mayhem Rodeo itself — big projects or quality craftsmanship, they're building opportunities for our future riders.",
  },
  {
    id: "death-rattle-taxidermy",
    name: "Death Rattle Taxidermy",
    tier: "Champion Buckle Sponsor",
    accent: "cyan",
    note: "65cc Ages 10–12 Champion Buckle",
    category: "Taxidermy",
    location: "Amador County, CA",
    website: "https://deathrattletaxidermy.com",
    logo: "/images/sponsors/death-rattle-taxidermy.webp",
    teaser: "Preserving the outdoors — backing the 65cc Ages 10–12 Buckle.",
    blurb:
      "Full-service taxidermy studio in Amador County — mounts, rugs, tanning, skull work and custom bone carving for big game, birds and fish. Death Rattle Taxidermy sponsors the 65cc Ages 10–12 Champion Buckle. Reach them at (209) 257-8170 or Info@deathrattletaxidermy.com.",
  },
  {
    id: "gold-and-sons-trucking",
    name: "Gold & Sons Trucking & Ready Mix",
    tier: "Champion Buckle Sponsor",
    accent: "yellow",
    note: "85cc Ages 8–10 Champion Buckle",
    category: "Trucking & Ready Mix",
    location: "Ione, CA",
    website: "https://goldandsonstrucking.com",
    logo: "/images/sponsors/gold-and-sons-trucking.webp",
    teaser: "Hauling the loads, backing the 85cc Ages 8–10 Buckle.",
    blurb:
      "A certified Disabled Veteran Business Enterprise trucking outfit and locally owned ready-mix concrete supplier serving Ione and Amador County since 2000. Gold & Sons puts up the 85cc Ages 8–10 Champion Buckle. Trucking: (209) 274-4365 · Ready Mix: (209) 274-0150.",
  },
  {
    id: "tommys-garage",
    name: "Tommy's Garage",
    tier: "Champion Buckle Sponsor",
    accent: "pink",
    note: "85cc Ages 11–12 Champion Buckle",
    category: "Auto Repair",
    location: "Ione, CA",
    website: "",
    logo: "/images/sponsors/tommys-garage.webp",
    teaser: "Keeping engines strong, backing the 85cc Ages 11–12 Buckle.",
    blurb:
      "A full-service, NAPA AutoCare–affiliated repair shop at 340 Preston Ave in Ione, known for honest, thorough work at a fair price. Tommy's Garage sponsors the 85cc Ages 11–12 Champion Buckle. Call (209) 274-0605.",
  },
  {
    id: "cheatham-equine-barrel-racing",
    name: "Cheatham Equine Barrel Racing Association",
    tier: "Champion Buckle Sponsor",
    accent: "cyan",
    note: "50cc Ages 4–6 Championship Buckle",
    category: "Barrel Racing Association",
    location: "Amador County, CA",
    website: "",
    logo: "/images/sponsors/cheatham-equine-barrel-racing.webp",
    teaser: "Backing our youngest riders' 50cc Ages 4–6 Buckle.",
    blurb:
      "A local barrel racing association helping launch our youngest riders. CEBRA puts up the championship buckle for the 50cc Ages 4–6 class, giving pee-wee riders a shot at their first title.",
  },
  {
    id: "halls-electric",
    name: "Hall's Electric",
    tier: "Event Sponsor",
    accent: "yellow",
    note: "",
    category: "Electrical Contractor",
    location: "Jackson, CA",
    website: "https://www.hallselectric.com",
    logo: "/images/sponsors/halls-electric.webp",
    teaser: "Certified Generac dealer powering up Moto Mayhem.",
    blurb:
      "Commercial and residential electrical contractor at 842 Hwy 88 in Jackson, and a certified Generac dealer for home standby and commercial generators. Run by Mike & Pam Hall. Call (209) 257-1779 or email mike@hallselectric.com.",
  },
  {
    id: "n6-llc-general-engineering",
    name: "N6 LLC General Engineering",
    tier: "Event Sponsor",
    accent: "pink",
    note: "",
    category: "General Engineering",
    location: "Pine Grove, CA",
    website: "",
    logo: "/images/sponsors/n6-llc-general-engineering.webp",
    teaser: "Strong foundations, Lic #1088724.",
    blurb:
      "Licensed general engineering contractor based in Pine Grove (Lic #1088724), handling everything from the ground up. N6 LLC backs Moto Mayhem Rodeo just like they build — strong foundations for the community. Call (209) 996-2073.",
  },
  {
    id: "don-luis",
    name: "Don Luis Mexican Restaurant",
    tier: "Event Sponsor",
    accent: "cyan",
    note: "",
    category: "Restaurant",
    location: "Ione, CA",
    website: "https://donluismexicanrestaurantca.com",
    logo: "/images/sponsors/don-luis.webp",
    teaser: "Authentic Mexican-American cuisine in Ione since 2004.",
    blurb:
      "Ione's hometown Mexican-American kitchen at 21 W Main St, serving enchiladas, tacos, chiles rellenos and carne asada since 2004. Don Luis invests right back into the community it feeds. Call (209) 437-6683.",
  },
  {
    id: "rb-hauling",
    name: "RB Hauling",
    tier: "Event Sponsor",
    accent: "yellow",
    note: "",
    category: "Livestock Hauling",
    location: "Ione, CA",
    website: "",
    logo: "/images/sponsors/rb-hauling.webp",
    teaser: "Dependable livestock hauling for Amador County ranchers.",
    blurb:
      "Serving Amador County's agricultural community with dependable livestock hauling and deceased livestock removal, working with local vets for same-day service. RB Hauling is proud to back the next generation of riders. Call (209) 986-2099.",
  },
  {
    id: "dunlop-family-furniture",
    name: "Dunlop Family Furniture & Mattress",
    tier: "Event Sponsor",
    accent: "pink",
    note: "",
    category: "Furniture & Mattress",
    location: "Jackson, CA",
    website: "https://www.dunlopfamilyfurniture.com",
    logo: "/images/sponsors/dunlop-family-furniture.webp",
    teaser: "Local and affordable since 1997.",
    blurb:
      "A locally owned family furniture and mattress store serving Jackson, Ione and Sutter Creek since 1997 — quality furniture, comfortable mattresses, and real customer service. Open daily. Call (209) 223-2220.",
  },
];

export const getSponsor = (id) => SPONSORS.find((s) => s.id === id);

export const IMAGES = {
  hero: "https://images.unsplash.com/photo-1637431155699-8b379d496434?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwzfHxtb3RvY3Jvc3MlMjByYWNlJTIwZGlydCUyMGp1bXB8ZW58MHx8fHwxNzg0NTY3MjY4fDA&ixlib=rb-4.1.0&q=85",
  event: "https://images.pexels.com/photos/144113/pexels-photo-144113.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  kids: "https://images.pexels.com/photos/33639182/pexels-photo-33639182.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  checker: "https://images.unsplash.com/photo-1703929755159-a1a8835a0536?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxjaGVja2VyZWQlMjBmbGFnJTIwcmFjaW5nJTIwdGV4dHVyZXxlbnwwfHx8fDE3ODQ1NjcyNjh8MA&ixlib=rb-4.1.0&q=85",
};

// Event flyers shown in "The Poster Drop" gallery on the home page.
// To add more: drop images in `frontend/public/images/flyers/` and add
// their paths (e.g. "/images/flyers/2026-main.webp") to this list.
export const FLYERS = [
  "/images/flyers/main-event-flyer.webp",
  "/images/flyers/moto-mayhem-month.webp",
  "/images/flyers/10-days-to-go.webp",
  "/images/flyers/7-days-to-go.webp",
  "/images/flyers/5-days-to-go.webp",
];

export const accentClass = {
  yellow: "text-brand-yellow",
  pink: "text-brand-pink",
  cyan: "text-brand-cyan",
};
export const accentBorder = {
  yellow: "hover:border-brand-yellow",
  pink: "hover:border-brand-pink",
  cyan: "hover:border-brand-cyan",
};

export const MEMORIAL = {
  name: "Donny Tillery",
  number: "26s",
  born: "Jan 26, 1972",
  died: "Nov 20, 2022",
  image: "/images/memorial-donny-tillery.webp",
  lines: ["Forever in our hearts.", "Forever on the track.", "Never forgotten."],
  quote: "Some ride for fun, others ride for life. You rode with your soul.",
};
