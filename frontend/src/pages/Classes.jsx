import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion";
import Kicker from "@/components/Kicker";
import SectionMarquee from "@/components/SectionMarquee";
import { CLASSES, EVENT, accentClass } from "@/data/rodeo";

export default function Classes() {
  return (
    <div data-testid="classes-page">
      <section className="pt-36 sm:pt-44 pb-14 bg-black border-b-2 border-ink-800">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
          <Reveal>
            <Kicker color="yellow">Moto Classes</Kicker>
            <h1 className="font-display uppercase text-6xl sm:text-8xl leading-[0.85]">
              Pick Your <span className="text-brand-pink">Class</span>
            </h1>
            <p className="text-zinc-400 text-lg mt-6 max-w-2xl">
              One entry allowed per class · ${EVENT.price} per entry · includes 3 events + custom t-shirt.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-20 bg-ink-900">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px">
            {CLASSES.map((c, i) => (
              <Reveal key={c.id} delay={(i % 3) * 0.06}>
                <div className="group bg-black border-2 border-ink-800 p-8 h-full hover:bg-brand-yellow transition-colors duration-200 relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <span className={`font-mono font-extrabold text-5xl ${accentClass[c.accent]} group-hover:text-black transition-colors`}>
                      {c.cc}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 group-hover:text-black/70 transition-colors">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-display uppercase text-3xl mt-6 leading-none group-hover:text-black transition-colors">
                    {c.label}
                  </h3>
                  <p className="font-mono text-sm text-zinc-400 mt-2 group-hover:text-black/80 transition-colors">
                    Ages {c.age}
                  </p>
                  {c.note && (
                    <p className="text-xs text-brand-pink mt-4 group-hover:text-black/70 transition-colors uppercase tracking-wide">
                      {c.note}
                    </p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SectionMarquee items={["50cc", "65cc", "85cc", "110cc", "Teen", "Adult"]} direction="right" outline={false} />

      <section className="py-24 bg-black">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
          <h2 className="font-display uppercase text-4xl sm:text-6xl leading-none max-w-xl">
            Found your class? Lock your spot.
          </h2>
          <Link
            to="/register"
            data-testid="classes-register-btn"
            className="inline-flex items-center gap-3 font-anton uppercase tracking-widest text-lg px-10 py-5 bg-brand-yellow text-black hover:bg-brand-cyan transition-colors shadow-[6px_6px_0px_#ec4899]"
          >
            Register Now <ArrowRight size={22} />
          </Link>
        </div>
      </section>
    </div>
  );
}
