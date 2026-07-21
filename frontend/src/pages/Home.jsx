import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Flag,
  MapPin,
  ShieldCheck,
  Shirt,
  Trophy,
  Zap,
} from "lucide-react";
import { Reveal } from "@/components/motion";
import Kicker from "@/components/Kicker";
import Countdown from "@/components/Countdown";
import SectionMarquee from "@/components/SectionMarquee";
import { EVENT, EVENTS, IMAGES, SPONSORS, FLYERS, accentClass } from "@/data/rodeo";

const RACE_FACTS = [
  { value: "3", label: "Events", icon: Flag },
  { value: "1", label: "Custom T-shirt", icon: Shirt },
  { value: "$", label: "Cash Payout", icon: Trophy },
  { value: "1", label: "Champion Buckle", icon: Zap },
];

const QUICK_INFO = [
  { icon: CalendarDays, label: "Race Day", value: "July 25, 2026", accent: "text-brand-yellow" },
  { icon: MapPin, label: "The Arena", value: "Ed Hughes Memorial Arena", accent: "text-brand-cyan" },
  { icon: Clock3, label: "First Call", value: "Check-in at 9:00 AM", accent: "text-brand-pink" },
];

const CHAPTERS = [
  {
    num: "01",
    title: "Speed Meets Skill",
    body: "Kids on two wheels, dirt in the air, and a course built to reward control at full throttle. This is grassroots motocross with a rodeo soul.",
  },
  {
    num: "02",
    title: "Three Runs. One Entry.",
    body: "Barrels, Pole Whipping, and Single Stake. Every class entry includes all three events and a custom MOTO Mayhem tee.",
  },
  {
    num: "03",
    title: "Champions Take More",
    body: "First place earns a cash payout. The 110cc 12 & Under champion takes home a custom buckle sponsored by Gold's Bakery.",
  },
];

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.12]);

  return (
    <div data-testid="home-page" className="bg-ink-950 overflow-hidden">
      {/* HERO POSTER */}
      <section ref={heroRef} className="relative min-h-[880px] lg:min-h-[960px] flex items-center pt-28 overflow-hidden border-b-4 border-brand-cyan">
        <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-0">
          <img
            src="/images/moto-hero-stitch.jpg"
            alt="Motocross rider launching over a dirt ridge"
            className="w-full h-full object-cover object-[44%_center]"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/45 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
        <div className="halftone-overlay absolute inset-0 opacity-70" />
        <div className="poster-grid absolute inset-0 opacity-40" />

        <div className="relative z-10 max-w-[1500px] mx-auto w-full px-5 sm:px-8 py-20 lg:py-24">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-10 items-center">
            <div className="relative max-w-5xl">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55 }}
                className="inline-flex items-center gap-3 bg-black/75 border-l-4 border-brand-cyan px-4 py-2 mb-6 torn-label"
              >
                <span className="font-condensed font-extrabold uppercase tracking-[0.18em] text-brand-cyan text-xs sm:text-sm">
                  {EVENT.city}
                </span>
                <span className="text-brand-pink">◆</span>
                <span className="font-condensed font-extrabold uppercase tracking-[0.18em] text-white text-xs sm:text-sm">
                  {EVENT.date}
                </span>
              </motion.div>

              <div className="relative font-display uppercase leading-[0.72] hero-title -rotate-1">
                <motion.span
                  initial={{ y: 70, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.65, ease: [0.2, 0.8, 0.2, 1] }}
                  className="block text-[24vw] sm:text-[18vw] lg:text-[13rem] text-brand-yellow"
                >
                  MOTO
                </motion.span>
                <motion.span
                  initial={{ y: 70, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.12, duration: 0.65, ease: [0.2, 0.8, 0.2, 1] }}
                  className="block text-[21vw] sm:text-[17vw] lg:text-[11.6rem] text-white ml-[4vw] lg:ml-14"
                >
                  Mayhem
                </motion.span>
                <motion.span
                  initial={{ y: 70, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.24, duration: 0.65, ease: [0.2, 0.8, 0.2, 1] }}
                  className="block text-[23vw] sm:text-[18vw] lg:text-[12.5rem] text-brand-pink ml-[1vw] lg:ml-4"
                >
                  Rodeo
                </motion.span>
                <motion.span
                  initial={{ scale: 0.7, rotate: -12, opacity: 0 }}
                  animate={{ scale: 1, rotate: -8, opacity: 1 }}
                  transition={{ delay: 0.75, type: "spring", stiffness: 170 }}
                  className="font-brush normal-case absolute right-[4%] top-[3%] sm:top-[1%] text-[9vw] sm:text-[6vw] lg:text-7xl text-brand-cyan drop-shadow-[3px_3px_0_#080a09]"
                >
                  Ride!
                </motion.span>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.5 }}
                className="mt-9 flex flex-col sm:flex-row sm:items-center gap-5"
              >
                <Link
                  to="/register"
                  data-testid="hero-register-btn"
                  className="group min-h-14 inline-flex items-center justify-center gap-3 font-anton uppercase tracking-widest text-xl px-9 py-4 bg-brand-yellow text-black border-2 border-brand-yellow hover:bg-black hover:text-brand-yellow transition-colors poster-shadow-pink clip-corner"
                >
                  Register to Ride
                  <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/classes"
                  className="min-h-14 inline-flex items-center justify-center font-anton uppercase tracking-widest text-xl px-9 py-4 border-2 border-white text-white hover:border-brand-cyan hover:text-brand-cyan transition-colors clip-corner bg-black/35"
                >
                  View Classes
                </Link>
              </motion.div>
            </div>

            <motion.aside
              initial={{ opacity: 0, rotate: 12, scale: 0.75 }}
              animate={{ opacity: 1, rotate: 5, scale: 1 }}
              transition={{ delay: 0.65, type: "spring", stiffness: 130 }}
              className="relative mx-auto lg:mx-0"
            >
              <div className="price-burst w-52 h-52 lg:w-64 lg:h-64 bg-brand-yellow text-black flex flex-col items-center justify-center text-center poster-shadow-pink">
                <span className="font-display text-7xl lg:text-8xl leading-none">${EVENT.price}</span>
                <span className="font-condensed font-extrabold uppercase tracking-[0.12em] text-xl">Per Rider</span>
              </div>
              <p className="font-brush text-brand-orange text-3xl -rotate-6 text-center mt-4">3 events + a custom tee</p>
            </motion.aside>
          </div>
        </div>
      </section>

      {/* RACE FACTS RAIL */}
      <section className="relative bg-brand-cream text-black border-b-4 border-black">
        <div className="race-stripes absolute top-0 left-0 w-full h-3" />
        <div className="max-w-[1500px] mx-auto px-5 sm:px-8 pt-8 pb-5 grid grid-cols-2 lg:grid-cols-4 gap-y-6">
          {RACE_FACTS.map((fact, i) => (
            <div key={fact.label} className={`flex items-center gap-4 px-3 sm:px-6 ${i > 0 ? "lg:border-l-2 border-black/30" : ""}`}>
              <fact.icon size={26} strokeWidth={2.5} className={i % 2 ? "text-brand-cyan" : "text-brand-pink"} />
              <span className="font-display text-4xl sm:text-5xl leading-none">{fact.value}</span>
              <span className="font-condensed font-extrabold uppercase text-lg sm:text-2xl leading-none">{fact.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* COUNTDOWN + RACE BOARD */}
      <section className="relative py-20 sm:py-28 bg-ink-900 poster-grid border-b-2 border-ink-800">
        <div className="max-w-[1500px] mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16 items-center">
            <Reveal>
              <div className="relative">
                <span className="absolute -top-4 left-7 z-10 torn-label bg-brand-pink text-white font-condensed font-extrabold uppercase tracking-[0.18em] px-5 py-2">
                  Warning: Mayhem Incoming
                </span>
                <div className="border-2 border-brand-yellow p-8 sm:p-12 pt-12 sm:pt-14 bg-black clip-corner poster-shadow-cyan">
                  <h2 className="font-display uppercase text-6xl sm:text-8xl leading-[0.84]">
                    Gates<br /><span className="text-brand-yellow">Open In</span>
                  </h2>
                  <div className="mt-10 overflow-x-auto pb-2"><Countdown /></div>
                </div>
              </div>
            </Reveal>

            <div className="grid gap-px bg-ink-800 border-2 border-ink-800">
              {QUICK_INFO.map((item, i) => (
                <Reveal key={item.label} delay={i * 0.08}>
                  <div className="group bg-black px-7 py-7 sm:px-9 flex items-center gap-6 hover:bg-ink-900 transition-colors">
                    <item.icon className={`${item.accent} shrink-0`} size={36} strokeWidth={2.2} />
                    <div>
                      <p className="font-condensed font-extrabold uppercase tracking-[0.18em] text-zinc-500 text-sm">{item.label}</p>
                      <p className="font-display uppercase text-3xl sm:text-4xl leading-none mt-1 group-hover:text-brand-yellow transition-colors">{item.value}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionMarquee items={["Ride Hard", "Cause Mayhem", "Have Fun", "Ione California"]} />

      {/* MANIFESTO */}
      <section className="py-24 sm:py-32 bg-black relative">
        <div className="absolute inset-0 diag-lines opacity-30" />
        <div className="relative max-w-[1500px] mx-auto px-5 sm:px-8">
          <Reveal className="mb-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-7">
            <div>
              <Kicker color="cyan">Built for the bold</Kicker>
              <h2 className="font-display uppercase text-6xl sm:text-8xl leading-[0.83] max-w-4xl">
                Dirt flies.<br /><span className="text-brand-yellow">Legends stick.</span>
              </h2>
            </div>
            <p className="font-brush text-brand-pink text-3xl sm:text-4xl -rotate-3 max-w-md">Mayhem on two wheels. Memories for life.</p>
          </Reveal>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {CHAPTERS.map((chapter, i) => (
              <Reveal key={chapter.num} delay={i * 0.08}>
                <article className={`relative h-full border-2 p-8 sm:p-10 bg-ink-900 clip-corner ${i === 1 ? "lg:translate-y-10 border-brand-cyan" : i === 2 ? "border-brand-pink" : "border-brand-yellow"}`}>
                  <span className="font-display text-8xl leading-none text-outline absolute right-5 top-3 opacity-60">{chapter.num}</span>
                  <p className={`font-condensed font-extrabold uppercase tracking-[0.18em] text-sm ${i === 0 ? "text-brand-yellow" : i === 1 ? "text-brand-cyan" : "text-brand-pink"}`}>Heat {chapter.num}</p>
                  <h3 className="font-display uppercase text-4xl sm:text-5xl leading-[0.9] mt-16 max-w-xs">{chapter.title}</h3>
                  <p className="text-zinc-400 text-lg leading-relaxed mt-6">{chapter.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section className="py-24 sm:py-32 bg-ink-900 border-y-4 border-brand-cyan relative poster-grid">
        <div className="max-w-[1500px] mx-auto px-5 sm:px-8">
          <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-14">
            <div>
              <span className="inline-block bg-brand-yellow text-black torn-label px-5 py-2 font-condensed font-extrabold uppercase tracking-widest mb-5">Every entry. Every event.</span>
              <h2 className="font-display uppercase text-7xl sm:text-9xl leading-[0.82]">The <span className="text-brand-cyan">Mayhem</span></h2>
            </div>
            <p className="max-w-md text-zinc-300 text-lg leading-relaxed border-l-4 border-brand-pink pl-5">
              Three timed tests of throttle control, nerve, and precision. Ride all three. Leave nothing in the dirt.
            </p>
          </Reveal>

          <div className="grid lg:grid-cols-3 gap-7">
            {EVENTS.map((event, i) => (
              <Reveal key={event.num} delay={i * 0.1}>
                <article className={`group relative bg-black border-2 p-8 sm:p-10 min-h-[340px] overflow-hidden clip-corner ${i === 0 ? "border-brand-yellow" : i === 1 ? "border-brand-cyan lg:translate-y-8" : "border-brand-pink"}`}>
                  <span className="font-display text-[9rem] leading-none text-outline absolute -right-2 -top-4 opacity-30 group-hover:opacity-60 transition-opacity">{event.num}</span>
                  <span className={`inline-block torn-label px-4 py-2 bg-ink-800 font-condensed font-extrabold uppercase tracking-[0.16em] text-xs ${accentClass[event.accent]}`}>Timed event</span>
                  <h3 className="relative font-display uppercase text-5xl sm:text-6xl mt-16 leading-[0.86] group-hover:text-brand-yellow transition-colors">{event.name}</h3>
                  <p className="relative text-zinc-400 text-lg mt-5 leading-relaxed max-w-sm">{event.desc}</p>
                  <Flag className="absolute -bottom-5 -right-2 text-ink-800 group-hover:text-brand-pink/50 transition-colors" size={100} />
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PAYOUT + SAFETY */}
      <section className="relative py-24 sm:py-32 bg-black overflow-hidden">
        <div className="absolute inset-0 halftone-overlay opacity-30" />
        <div className="relative max-w-[1500px] mx-auto px-5 sm:px-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <Reveal>
            <div className="relative bg-brand-cream text-black p-10 sm:p-16 ink-edge -rotate-1 poster-shadow-pink">
              <Trophy className="text-brand-pink mb-6" size={52} strokeWidth={2.5} />
              <p className="font-condensed font-extrabold uppercase tracking-[0.2em] text-brand-pink">First place takes cash</p>
              <h2 className="font-display uppercase text-7xl sm:text-9xl leading-[0.8] mt-4">Ride for<br />the buckle.</h2>
              <p className="font-condensed font-semibold text-xl sm:text-2xl mt-8 max-w-2xl leading-snug">
                The 110cc 12 &amp; Under champion earns a custom championship buckle, backed by Gold's Bakery.
              </p>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: ShieldCheck, title: "Gear Check", text: "Helmet and proper riding gear are required before entering the arena." },
              { icon: Clock3, title: "Safety Meeting", text: "All riders attend the mandatory 10:00 AM race-day briefing." },
              { icon: Flag, title: "Three Events", text: "Barrels, Pole Whipping, and Single Stake come with every entry." },
              { icon: Shirt, title: "Custom Tee", text: "Every $100 class entry includes an official MOTO Mayhem shirt." },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div className="h-full border-2 border-ink-800 p-7 bg-ink-900 hover:border-brand-cyan transition-colors clip-corner">
                  <item.icon className={i % 2 ? "text-brand-cyan" : "text-brand-yellow"} size={30} />
                  <h3 className="font-display uppercase text-3xl mt-6 leading-none">{item.title}</h3>
                  <p className="text-zinc-400 mt-3 leading-relaxed">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FLYER WALL */}
      <section className="py-24 bg-ink-900 border-y-2 border-ink-800 poster-grid">
        <div className="max-w-[1500px] mx-auto px-5 sm:px-8">
          <Reveal className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <Kicker color="pink">Straight off the wall</Kicker>
              <h2 className="font-display uppercase text-6xl sm:text-8xl leading-none">The Poster Drop</h2>
            </div>
            <p className="font-brush text-brand-yellow text-3xl -rotate-2">Save it. Share it. Show up.</p>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
            {FLYERS.map((flyer, i) => (
              <Reveal key={flyer} delay={i * 0.05}>
                <div className={`border-4 overflow-hidden group aspect-[3/4] bg-black poster-shadow-${i % 2 ? "cyan" : "pink"} ${i % 2 ? "rotate-2 border-brand-cyan" : "-rotate-2 border-brand-pink"}`}>
                  <img src={flyer} alt={`MOTO Mayhem event flyer ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SPONSORS */}
      <section className="py-24 bg-black">
        <div className="max-w-[1500px] mx-auto px-5 sm:px-8">
          <Reveal className="flex flex-col sm:flex-row justify-between sm:items-end gap-7 mb-12">
            <h2 className="font-display uppercase text-6xl sm:text-8xl leading-[0.84]">
              Backed by<br /><span className="text-brand-yellow">the community.</span>
            </h2>
            <Link to="/sponsors" className="font-condensed font-extrabold uppercase text-base tracking-[0.16em] text-brand-cyan hover:text-brand-yellow transition-colors flex items-center gap-2">
              Meet every sponsor <ArrowRight size={19} />
            </Link>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-ink-800 border-2 border-ink-800">
            {SPONSORS.slice(0, 6).map((s, i) => (
              <Reveal key={s.name} delay={i * 0.05}>
                <div className="bg-ink-900 p-7 sm:p-10 h-full hover:bg-brand-cream hover:text-black transition-colors group">
                  <p className="font-display uppercase text-2xl sm:text-4xl leading-none">{s.name}</p>
                  <p className="font-condensed font-bold text-xs sm:text-sm uppercase tracking-widest text-brand-pink mt-3 group-hover:text-brand-pink">{s.tier}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL POSTER CTA */}
      <section className="relative py-28 sm:py-40 overflow-hidden border-t-4 border-brand-yellow">
        <img src={IMAGES.kids} alt="Young rider racing a dirt bike" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/80" />
        <div className="absolute inset-0 halftone-overlay opacity-60" />
        <div className="relative z-10 max-w-[1200px] mx-auto px-5 sm:px-8 text-center">
          <Reveal>
            <p className="font-brush text-brand-cyan text-3xl sm:text-5xl -rotate-2 mb-5">The gate is waiting.</p>
            <h2 className="font-display uppercase text-7xl sm:text-[9rem] leading-[0.76] hero-title">
              Who's ready<br /><span className="text-brand-yellow">to ride?</span>
            </h2>
            <p className="font-condensed font-extrabold uppercase tracking-[0.18em] text-zinc-200 mt-9 text-lg">
              {EVENT.date} · {EVENT.city} · ${EVENT.price} per entry
            </p>
            <Link
              to="/register"
              data-testid="cta-register-btn"
              className="inline-flex items-center gap-3 mt-10 font-anton uppercase tracking-widest text-2xl px-11 py-5 bg-brand-yellow text-black border-2 border-brand-yellow hover:bg-black hover:text-brand-yellow transition-colors poster-shadow-pink clip-corner"
            >
              Register to Ride <ArrowRight size={27} />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
