import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion";
import Kicker from "@/components/Kicker";
import { SPONSORS, EVENT } from "@/data/rodeo";

export default function Sponsors() {
  const featured = SPONSORS[0];
  const rest = SPONSORS.slice(1);

  return (
    <div data-testid="sponsors-page">
      <section className="pt-36 sm:pt-44 pb-14 bg-black border-b-2 border-ink-800">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
          <Reveal>
            <Kicker color="pink">Sponsor Shout Out</Kicker>
            <h1 className="font-display uppercase text-6xl sm:text-8xl leading-[0.85]">
              The Ones Who <span className="text-brand-yellow">Back Us</span>
            </h1>
            <p className="text-zinc-400 text-lg mt-6 max-w-2xl">
              Sponsors make Moto Mayhem Rodeo possible and give young riders the chance to compete for a
              championship buckle. Support the businesses that support our riding community.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-20 bg-ink-900 border-b-2 border-ink-800">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="border-2 border-brand-yellow bg-black p-10 sm:p-16 relative overflow-hidden">
              <Heart className="text-brand-pink mb-6" size={44} />
              <Kicker color="yellow">{featured.tier}</Kicker>
              <h2 className="font-display uppercase text-5xl sm:text-7xl leading-none">{featured.name}</h2>
              <p className="text-zinc-400 text-lg mt-6 max-w-2xl">
                A huge thank you to {featured.name} for sponsoring the {featured.note}. From baking fresh
                favorites for the community to supporting the next generation of champions — you make this
                event even sweeter.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px">
            {rest.map((s, i) => (
              <Reveal key={i} delay={(i % 3) * 0.06}>
                <div className="bg-ink-900 border-2 border-ink-800 p-10 h-full hover:border-brand-cyan transition-colors">
                  <p className="font-display uppercase text-3xl leading-none">{s.name}</p>
                  <p className="font-mono text-xs uppercase tracking-widest text-brand-pink mt-3">{s.tier}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-ink-900 border-t-2 border-ink-800">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 text-center">
          <Reveal>
            <h2 className="font-display uppercase text-5xl sm:text-7xl leading-[0.9]">
              Want To <span className="text-brand-pink">Sponsor</span> The Mayhem?
            </h2>
            <p className="text-zinc-400 text-lg mt-6 max-w-xl mx-auto">
              Get your business in front of the whole riding community. Reach out and join the Moto Mayhem family.
            </p>
            <Link
              to="/contact"
              data-testid="sponsor-contact-btn"
              className="inline-flex items-center gap-3 mt-10 font-anton uppercase tracking-widest text-lg px-10 py-5 bg-brand-yellow text-black hover:bg-brand-cyan transition-colors shadow-[6px_6px_0px_#ec4899]"
            >
              Become A Sponsor <ArrowRight size={22} />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
