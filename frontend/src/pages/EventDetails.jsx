import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Clock, ArrowRight, CheckCircle2, ZoomIn } from "lucide-react";
import { Reveal } from "@/components/motion";
import Kicker from "@/components/Kicker";
import Countdown from "@/components/Countdown";
import FlyerLightbox from "@/components/FlyerLightbox";
import { EVENT, SCHEDULE, IMAGES } from "@/data/rodeo";

const PATTERNS = [
  { src: "/images/patterns/barrel-single-stake-pattern.jpg", label: "Barrels & Single Stake" },
  { src: "/images/patterns/pole-whipping-pattern.jpg", label: "Pole Whipping" },
];

function PageHead({ kicker, title, sub }) {
  return (
    <section className="pt-36 sm:pt-44 pb-14 bg-black border-b-2 border-ink-800">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
        <Reveal>
          <Kicker color="cyan">{kicker}</Kicker>
          <h1 className="font-display uppercase text-6xl sm:text-8xl leading-[0.85]">{title}</h1>
          {sub && <p className="text-zinc-400 text-lg mt-6 max-w-2xl">{sub}</p>}
        </Reveal>
      </div>
    </section>
  );
}

export default function EventDetails() {
  const [patternIndex, setPatternIndex] = useState(null);
  const info = [
    { icon: MapPin, label: "Location", value: `${EVENT.location}, ${EVENT.city}` },
    { icon: Calendar, label: "Date", value: EVENT.date },
    { icon: Clock, label: "Ride Time", value: "12:00 PM" },
  ];
  const rules = [
    "Riding is only allowed on the Ed Hughes Memorial Arena property — dirt bikes are not permitted beyond posted signage.",
    "Only 50cc, 65cc, 85cc, and 110cc dirt bikes are allowed in the arena. No paddle tires, no electric bikes.",
    "Engines must be stock — no modifications except exhaust. Bike inspections happen at check-in.",
    "All riders must wear a dirt bike helmet, boots, pants, and a long sleeve shirt. Gear inspections happen at check-in.",
    "All riders and parents must attend the mandatory 10:00 AM safety meeting.",
    "Riders must wear their back number the entire event — assigned and provided at check-in.",
    "AMA age rule applies: rider's age as of January 1, 2026 determines which class(es) they qualify for.",
    "Parents are only allowed in the arena for the 50cc (4–6) class.",
    "One entry per class, but riders may enter multiple classes if age and bike qualify. Only one rider on course at a time.",
    "Scoring: each event is timed and all three times are combined into a cumulative time. Top 3 in each class place 1st–3rd, and 1st place wins a custom championship buckle.",
    "Penalties: +5 seconds for each barrel or cone knocked over, +10 seconds for going off course.",
    "Payment is Venmo or cash at check-in — due when you arrive.",
    `Pre-registration forms are due by ${EVENT.regDeadline}.`,
  ];

  return (
    <div data-testid="event-page">
      <PageHead
        kicker="Event Details"
        title="The Rundown"
        sub={`${EVENT.tagline}. Everything you need to know before the gates swing open in ${EVENT.city}.`}
      />

      <section className="py-20 bg-ink-900 border-b-2 border-ink-800">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 grid md:grid-cols-3 gap-px">
          {info.map((it, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="bg-black border-2 border-ink-800 p-8 h-full hover:border-brand-yellow transition-colors">
                <it.icon className="text-brand-pink mb-5" size={30} />
                <p className="font-mono uppercase tracking-[0.2em] text-xs text-zinc-500">{it.label}</p>
                <p className="font-display uppercase text-2xl mt-2 leading-none">{it.value}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SCHEDULE */}
      <section className="relative py-24 bg-black overflow-hidden">
        <img src={IMAGES.checker} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.04]" />
        <div className="relative max-w-[1400px] mx-auto px-5 sm:px-8">
          <Reveal className="mb-12">
            <Kicker color="cyan">Day Schedule</Kicker>
            <h2 className="font-display uppercase text-5xl sm:text-7xl leading-none">Race Day Timeline</h2>
          </Reveal>
          <div className="space-y-px">
            {SCHEDULE.map((s, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="group grid grid-cols-12 gap-4 items-center py-8 border-t-2 border-ink-800 hover:bg-ink-900/50 transition-colors px-2">
                  <span className="col-span-4 sm:col-span-3 font-mono font-extrabold text-3xl sm:text-5xl text-brand-yellow tabular-nums">
                    {s.time}
                  </span>
                  <span className="col-span-8 sm:col-span-4 font-display uppercase text-2xl sm:text-3xl leading-none group-hover:text-brand-pink transition-colors">
                    {s.label}
                  </span>
                  <span className="col-span-12 sm:col-span-5 text-zinc-500">{s.note}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* RULES */}
      <section className="py-24 bg-ink-900 border-y-2 border-ink-800">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-14">
          <Reveal>
            <h2 className="font-display uppercase text-5xl sm:text-6xl leading-none mb-8">
              Rules &amp; <span className="text-brand-yellow">Safety</span>
            </h2>
            <ul className="space-y-5">
              {rules.map((r, i) => (
                <li key={i} className="flex items-start gap-4 text-zinc-300 text-lg">
                  <CheckCircle2 className="text-brand-cyan shrink-0 mt-1" size={22} />
                  {r}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="border-2 border-ink-800 p-10 bg-black h-full flex flex-col justify-between">
              <div>
                <Kicker color="pink">Countdown</Kicker>
                <Countdown compact />
              </div>
              <div className="mt-10">
                <p className="text-zinc-400 mb-6">Grab your bike, load the trailer, and get your crew ready.</p>
                <Link
                  to="/register"
                  data-testid="event-register-btn"
                  className="inline-flex items-center gap-2 font-anton uppercase tracking-widest px-8 py-4 bg-brand-yellow text-black hover:bg-brand-cyan transition-colors shadow-[5px_5px_0px_#ec4899]"
                >
                  Register — ${EVENT.price} <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PATTERNS */}
      <section className="py-24 bg-black">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
          <Reveal className="mb-12">
            <Kicker color="yellow">Know The Course</Kicker>
            <h2 className="font-display uppercase text-5xl sm:text-7xl leading-none">Event Patterns</h2>
            <p className="text-zinc-400 text-lg mt-6 max-w-2xl">
              Study these before race day so you can walk the pattern with confidence at check-in.
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl">
            {PATTERNS.map((p, i) => (
              <Reveal key={p.src} delay={i * 0.08}>
                <button
                  type="button"
                  onClick={() => setPatternIndex(i)}
                  aria-label={`View ${p.label} pattern full size`}
                  className="relative block w-full text-left border-2 border-ink-800 overflow-hidden group bg-white hover:border-brand-cyan transition-colors"
                >
                  <img src={p.src} alt={`${p.label} pattern diagram`} className="w-full h-auto object-contain group-hover:scale-[1.02] transition-transform duration-500" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/45 transition-colors">
                    <span className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity font-condensed font-extrabold uppercase tracking-[0.14em] text-white text-xs sm:text-sm">
                      <ZoomIn size={18} className="text-brand-yellow" /> View Full Size
                    </span>
                  </span>
                  <span className="block bg-ink-900 text-center py-3 font-condensed font-extrabold uppercase tracking-[0.14em] text-sm text-zinc-300 group-hover:text-brand-cyan transition-colors">
                    {p.label}
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FlyerLightbox
        flyers={PATTERNS.map((p) => p.src)}
        index={patternIndex}
        onClose={() => setPatternIndex(null)}
        onChange={setPatternIndex}
        altPrefix="Event pattern diagram"
        ariaLabel="Pattern diagram viewer"
      />
    </div>
  );
}
