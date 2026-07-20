import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Flag, Trophy, ShieldCheck } from "lucide-react";
import { MaskReveal, Reveal } from "@/components/motion";
import Countdown from "@/components/Countdown";
import SectionMarquee from "@/components/SectionMarquee";
import { EVENT, EVENTS, IMAGES, SPONSORS, FLYERS, accentClass } from "@/data/rodeo";

const CHAPTERS = [
  {
    num: "01",
    title: "Speed Meets Skill",
    body: "Kids on two wheels, dirt in the air, and a course built to separate the brave from the rest. This is grassroots motocross at full throttle.",
  },
  {
    num: "02",
    title: "Three Events, One Entry",
    body: "Barrels, Pole Whipping, and Single Stake. One $100 entry gets your rider into all three plus a custom Moto Mayhem tee.",
  },
  {
    num: "03",
    title: "Champions Get Paid",
    body: "Cash payout for first place and a custom champion buckle for the 110cc class. Ride hard — the checkered flag remembers.",
  },
];

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.55, 0.9]);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-end overflow-hidden">
        <motion.div style={{ y, scale }} className="absolute inset-0">
          <img src={IMAGES.hero} alt="Motocross rider mid-jump" className="w-full h-full object-cover" />
        </motion.div>
        <motion.div style={{ opacity: overlayOpacity }} className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />
        <div className="checker-band absolute bottom-0 left-0 w-full h-4 opacity-60" />

        <div className="relative z-10 max-w-[1400px] mx-auto w-full px-5 sm:px-8 pb-24 pt-32">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-mono uppercase tracking-[0.35em] text-brand-cyan text-xs sm:text-sm mb-6"
          >
            {EVENT.city} — {EVENT.date}
          </motion.p>

          <MaskReveal
            start
            lines={["MOTO", "MAYHEM", "RODEO"]}
            className="font-display uppercase leading-[0.82]"
            lineClassName="text-[18vw] sm:text-[15vw] lg:text-[12rem]"
          />
          <div className="font-display uppercase leading-[0.82] -mt-2">
            <span className="text-brand-yellow" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-8 flex flex-col sm:flex-row sm:items-center gap-6"
          >
            <p className="font-mono uppercase tracking-[0.2em] text-sm text-zinc-300 max-w-md">
              Ride Hard <span className="text-brand-pink">·</span> Cause Mayhem{" "}
              <span className="text-brand-pink">·</span> Have Fun
            </p>
            <div className="flex gap-4">
              <Link
                to="/register"
                data-testid="hero-register-btn"
                className="group font-anton uppercase tracking-widest text-base px-8 py-4 bg-brand-yellow text-black border-2 border-transparent hover:bg-black hover:text-brand-yellow hover:border-brand-yellow transition-colors duration-200 shadow-[5px_5px_0px_#ec4899] flex items-center gap-2"
              >
                Register — ${EVENT.price}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/classes"
                className="font-anton uppercase tracking-widest text-base px-8 py-4 border-2 border-zinc-600 text-white hover:border-brand-cyan hover:text-brand-cyan transition-colors duration-200"
              >
                View Classes
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* COUNTDOWN BAND */}
      <section className="bg-ink-900 border-b-2 border-ink-800 py-14 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
          <div>
            <p className="font-mono uppercase tracking-[0.3em] text-brand-pink text-xs mb-3">Warning: Mayhem Incoming</p>
            <h2 className="font-display uppercase text-4xl sm:text-5xl leading-none">Gates Open In</h2>
          </div>
          <Countdown />
        </div>
      </section>

      {/* MANIFESTO CHAPTERS */}
      <section className="py-24 sm:py-32 bg-black">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
          <Reveal className="mb-16">
            <p className="font-mono uppercase tracking-[0.3em] text-brand-cyan text-xs mb-4">/ Why We Ride</p>
            <h2 className="font-display uppercase text-5xl sm:text-7xl leading-[0.9] max-w-3xl">
              Where speed meets skill and kids create mayhem on two wheels
            </h2>
          </Reveal>

          <div className="space-y-px">
            {CHAPTERS.map((c, i) => (
              <Reveal key={c.num} delay={i * 0.08}>
                <div className="group grid md:grid-cols-12 gap-6 items-start py-12 border-t-2 border-ink-800 hover:bg-ink-900/40 transition-colors px-2">
                  <span className="md:col-span-3 font-display text-8xl sm:text-9xl leading-none text-outline group-hover:text-outline-pink transition-all">
                    {c.num}
                  </span>
                  <h3 className="md:col-span-4 font-display uppercase text-3xl sm:text-4xl leading-none text-brand-yellow">
                    {c.title}
                  </h3>
                  <p className="md:col-span-5 text-zinc-400 text-lg leading-relaxed">{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <SectionMarquee items={["Barrels", "Pole Whipping", "Single Stake", "Cash Payout"]} />

      {/* 3 EVENTS */}
      <section className="py-24 sm:py-32 bg-ink-900">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
          <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
            <div>
              <p className="font-mono uppercase tracking-[0.3em] text-brand-pink text-xs mb-4">/ 3 Events Per Entry</p>
              <h2 className="font-display uppercase text-5xl sm:text-7xl leading-none">The Mayhem</h2>
            </div>
            <img src={IMAGES.event} alt="Motocross action" className="hidden sm:block w-64 h-40 object-cover border-2 border-ink-800 -skew-x-3" />
          </Reveal>

          <div className="grid md:grid-cols-3 gap-px">
            {EVENTS.map((e, i) => (
              <Reveal key={e.num} delay={i * 0.1}>
                <div className="group relative bg-black border-2 border-ink-800 p-8 h-full hover:border-brand-cyan transition-colors overflow-hidden">
                  <span className={`font-mono text-sm ${accentClass[e.accent]}`}>{e.num}</span>
                  <h3 className="font-display uppercase text-4xl mt-6 mb-4 leading-none group-hover:text-brand-yellow transition-colors">
                    {e.name}
                  </h3>
                  <p className="text-zinc-400 leading-relaxed">{e.desc}</p>
                  <Flag className="absolute -bottom-4 -right-4 text-ink-800 group-hover:text-brand-pink/40 transition-colors" size={90} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CASH PAYOUT */}
      <section className="relative py-24 sm:py-32 bg-black overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div className="border-2 border-brand-yellow p-10 sm:p-14 relative">
              <Trophy className="text-brand-yellow mb-6" size={48} />
              <h2 className="font-display uppercase text-6xl sm:text-7xl leading-[0.85]">
                Cash <span className="text-brand-pink">Payout</span>
              </h2>
              <p className="font-mono uppercase tracking-[0.2em] text-brand-cyan mt-4 text-sm">For First Place</p>
              <p className="text-zinc-400 mt-6 text-lg leading-relaxed">
                Take the top of the podium and take home the cash. The 110cc 12 &amp; Under champion also
                earns a custom championship buckle, sponsored by Gold's Bakery.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 gap-px">
              {[
                { icon: ShieldCheck, t: "Gear Required", d: "All riders wear a helmet + proper gear. Gear check at the booth." },
                { icon: Flag, t: "3 Events", d: "Barrels · Poles · Single Stake — all in one entry." },
                { icon: Trophy, t: "Custom Tee", d: "Every $100 entry includes a Moto Mayhem t-shirt." },
                { icon: ShieldCheck, t: "Safety First", d: "Mandatory safety meeting at 10:00 AM." },
              ].map((b, i) => (
                <div key={i} className="bg-ink-900 border-2 border-ink-800 p-6 hover:border-brand-pink transition-colors">
                  <b.icon className="text-brand-yellow mb-4" size={28} />
                  <h4 className="font-anton uppercase text-xl leading-none mb-2">{b.t}</h4>
                  <p className="text-zinc-500 text-sm leading-relaxed">{b.d}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FLYER GALLERY */}
      <section className="py-20 bg-ink-900 border-y-2 border-ink-800">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
          <Reveal className="mb-10">
            <p className="font-mono uppercase tracking-[0.3em] text-brand-cyan text-xs mb-3">/ Straight Off The Wall</p>
            <h2 className="font-display uppercase text-4xl sm:text-6xl leading-none">The Posters</h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {FLYERS.map((f, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="border-2 border-ink-800 overflow-hidden group aspect-[3/4]">
                  <img src={f} alt={`Moto Mayhem flyer ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SPONSORS STRIP */}
      <section className="py-24 bg-black">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
          <Reveal className="flex flex-col sm:flex-row justify-between sm:items-end gap-6 mb-12">
            <h2 className="font-display uppercase text-5xl sm:text-6xl leading-none">
              Powered By <span className="text-brand-yellow">Our Sponsors</span>
            </h2>
            <Link to="/sponsors" className="font-mono uppercase text-xs tracking-[0.2em] text-brand-cyan hover:text-brand-yellow transition-colors flex items-center gap-2">
              See all sponsors <ArrowRight size={16} />
            </Link>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px">
            {SPONSORS.slice(0, 6).map((s, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="bg-ink-900 border-2 border-ink-800 p-8 hover:border-brand-yellow transition-colors">
                  <p className="font-display uppercase text-2xl leading-none">{s.name}</p>
                  <p className="font-mono text-xs uppercase tracking-widest text-brand-pink mt-2">{s.tier}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-28 sm:py-40 overflow-hidden">
        <img src={IMAGES.kids} alt="Young rider on dirt bike" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/75" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-5 sm:px-8 text-center">
          <Reveal>
            <h2 className="font-display uppercase text-6xl sm:text-8xl leading-[0.85]">
              Who's Ready <br /> <span className="text-brand-pink">To Ride?</span>
            </h2>
            <Link
              to="/register"
              data-testid="cta-register-btn"
              className="inline-flex items-center gap-3 mt-10 font-anton uppercase tracking-widest text-xl px-10 py-5 bg-brand-yellow text-black hover:bg-brand-cyan transition-colors shadow-[6px_6px_0px_#ec4899]"
            >
              Register Now <ArrowRight size={24} />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
