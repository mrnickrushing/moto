import { Link } from "react-router-dom";
import { MapPin, Calendar, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/motion";
import Countdown from "@/components/Countdown";
import { EVENT, SCHEDULE, IMAGES } from "@/data/rodeo";

function PageHead({ kicker, title, sub }) {
  return (
    <section className="pt-36 sm:pt-44 pb-14 bg-black border-b-2 border-ink-800">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
        <Reveal>
          <p className="font-mono uppercase tracking-[0.3em] text-brand-cyan text-xs mb-4">{kicker}</p>
          <h1 className="font-display uppercase text-6xl sm:text-8xl leading-[0.85]">{title}</h1>
          {sub && <p className="text-zinc-400 text-lg mt-6 max-w-2xl">{sub}</p>}
        </Reveal>
      </div>
    </section>
  );
}

export default function EventDetails() {
  const info = [
    { icon: MapPin, label: "Location", value: `${EVENT.location}, ${EVENT.city}` },
    { icon: Calendar, label: "Date", value: EVENT.date },
    { icon: Clock, label: "Ride Time", value: "12:00 PM" },
  ];
  const rules = [
    "All riders must wear a helmet and proper gear.",
    "There will be a bike and gear check booth during check-ins.",
    "One entry allowed per class.",
    "50cc Pee-Wee (4–6): parent must be present in the arena during the event.",
    "Payment accepted online (card), Venmo, or cash.",
    `Pre-registration forms are due by ${EVENT.regDeadline}.`,
  ];

  return (
    <div data-testid="event-page">
      <PageHead
        kicker="/ Event Details"
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
            <p className="font-mono uppercase tracking-[0.3em] text-brand-cyan text-xs mb-4">/ Day Schedule</p>
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
                <p className="font-mono uppercase tracking-[0.3em] text-brand-pink text-xs mb-3">Countdown</p>
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
    </div>
  );
}
