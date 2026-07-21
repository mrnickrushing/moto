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
    teaser: "Hometown Ione bakery putting up the 110cc Champion Buckle.",
    blurb:
      "A hometown bakery in the heart of Ione run by Ronnie Gold, turning out fresh sourdough, cinnamon rolls, cookies and seasonal treats for all of Amador County. Gold's Bakery steps up as our Champion Buckle Sponsor — putting up the buckle for the 110cc 12 & Under class champion.",
  },
  {
    id: "two-wheels-co",
    name: "Two Wheels Co.",
    tier: "Gold Sponsor",
    accent: "yellow",
    note: "",
    category: "Moto Shop",
    location: "",
    website: "",
    teaser: "Gold Sponsor keeping local riders geared up.",
    blurb:
      "A proud Gold Sponsor of Moto Mayhem Rodeo and a champion of local two-wheeled culture — helping keep young riders geared up and on the track.",
  },
  {
    id: "dirt-devil-cycles",
    name: "Dirt Devil Cycles",
    tier: "Gold Sponsor",
    accent: "yellow",
    note: "",
    category: "Cycle Shop",
    location: "",
    website: "",
    teaser: "Gold Sponsor and friend of the dirt.",
    blurb:
      "Gold Sponsor and friend of the dirt. Dirt Devil Cycles backs the next generation of racers chasing mayhem and buckles.",
  },
  {
    id: "ione-feed-supply",
    name: "Ione Feed & Supply",
    tier: "Silver Sponsor",
    accent: "cyan",
    note: "",
    category: "Feed & Ranch Supply",
    location: "Ione, CA",
    website: "",
    teaser: "Amador County's local feed & ranch supply.",
    blurb:
      "Amador County's local stop for livestock feed, pet food, fencing and ranch supplies — started by longtime locals Randy & Michele Costa in 2017. A Silver Sponsor keeping the Ione riding community fueled and supported.",
  },
  {
    id: "checkered-flag-cafe",
    name: "Checkered Flag Café",
    tier: "Silver Sponsor",
    accent: "cyan",
    note: "",
    category: "Café",
    location: "",
    website: "",
    teaser: "Silver Sponsor fueling riders on race day.",
    blurb:
      "Silver Sponsor serving up fuel for riders and families on race day. Grab a bite, cheer on the mayhem.",
  },
];

export const getSponsor = (id) => SPONSORS.find((s) => s.id === id);

export const IMAGES = {
  hero: "https://images.unsplash.com/photo-1637431155699-8b379d496434?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwzfHxtb3RvY3Jvc3MlMjByYWNlJTIwZGlydCUyMGp1bXB8ZW58MHx8fHwxNzg0NTY3MjY4fDA&ixlib=rb-4.1.0&q=85",
  event: "https://images.pexels.com/photos/144113/pexels-photo-144113.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  kids: "https://images.pexels.com/photos/33639182/pexels-photo-33639182.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  checker: "https://images.unsplash.com/photo-1703929755159-a1a8835a0536?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxjaGVja2VyZWQlMjBmbGFnJTIwcmFjaW5nJTIwdGV4dHVyZXxlbnwwfHx8fDE3ODQ1NjcyNjh8MA&ixlib=rb-4.1.0&q=85",
};

export const FLYERS = [
  "https://customer-assets-lqy194kg.emergentagent.net/job_649a27b5-d56a-464c-b478-87669c5cab4f/artifacts/fwizbhnn_IMG_3863.webp",
  "https://customer-assets-lqy194kg.emergentagent.net/job_649a27b5-d56a-464c-b478-87669c5cab4f/artifacts/s37ivlgo_IMG_3857.webp",
  "https://customer-assets-lqy194kg.emergentagent.net/job_649a27b5-d56a-464c-b478-87669c5cab4f/artifacts/6othh4s8_IMG_3858.webp",
  "https://customer-assets-lqy194kg.emergentagent.net/job_649a27b5-d56a-464c-b478-87669c5cab4f/artifacts/ascrqqi3_IMG_3862.webp",
  "https://customer-assets-lqy194kg.emergentagent.net/job_649a27b5-d56a-464c-b478-87669c5cab4f/artifacts/yuie2k0p_IMG_3861.webp",
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
