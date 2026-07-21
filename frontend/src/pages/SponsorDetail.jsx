import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin, Trophy, Store } from "lucide-react";
import { Reveal } from "@/components/motion";
import Kicker from "@/components/Kicker";
import { getSponsor, SPONSORS } from "@/data/rodeo";

export default function SponsorDetail() {
  const { id } = useParams();
  const sponsor = getSponsor(id);

  if (!sponsor) {
    return (
      <div data-testid="sponsor-notfound" className="min-h-[60vh] flex items-center bg-black">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-32">
          <Kicker color="pink">Sponsor Not Found</Kicker>
          <h1 className="font-display uppercase text-6xl sm:text-8xl leading-[0.85]">
            No <span className="text-brand-pink">Such</span> Sponsor
          </h1>
          <p className="text-zinc-400 text-lg mt-6">That sponsor isn't on the board. Check out the ones who back us.</p>
          <Link
            to="/sponsors"
            className="inline-flex items-center gap-3 mt-8 font-anton uppercase tracking-widest px-8 py-4 bg-brand-yellow text-black hover:bg-brand-cyan transition-colors shadow-[5px_5px_0px_#ec4899]"
          >
            <ArrowLeft size={20} /> All Sponsors
          </Link>
        </div>
      </div>
    );
  }

  const others = SPONSORS.filter((s) => s.id !== sponsor.id).slice(0, 3);
  const monogram = sponsor.name.replace(/[^A-Za-z0-9 ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("");

  return (
    <div data-testid="sponsor-detail-page">
      <section className="pt-36 sm:pt-44 pb-16 bg-black border-b-2 border-ink-800">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
          <Reveal>
            <Link
              to="/sponsors"
              data-testid="sponsor-back"
              className="inline-flex items-center gap-2 font-condensed font-extrabold uppercase tracking-[0.14em] text-zinc-500 hover:text-brand-cyan transition-colors text-sm mb-8"
            >
              <ArrowLeft size={16} /> All Sponsors
            </Link>

            <div className="grid lg:grid-cols-[auto_1fr] gap-8 lg:gap-12 items-start">
              <div
                className={`hidden sm:flex w-40 h-40 lg:w-52 lg:h-52 shrink-0 items-center justify-center border-2 border-black shadow-[6px_6px_0_#080a09] font-display text-6xl lg:text-7xl text-black ${
                  sponsor.accent === "cyan"
                    ? "bg-brand-cyan"
                    : sponsor.accent === "pink"
                      ? "bg-brand-pink"
                      : "bg-brand-yellow"
                }`}
                aria-hidden="true"
              >
                {monogram}
              </div>

              <div>
                <Kicker color={sponsor.accent}>{sponsor.tier}</Kicker>
                <h1 className="font-display uppercase text-6xl sm:text-8xl leading-[0.85]">{sponsor.name}</h1>

                <div className="flex flex-wrap gap-3 mt-6">
                  {sponsor.category && (
                    <span className="inline-flex items-center gap-2 border-2 border-ink-800 px-4 py-2 font-condensed font-extrabold uppercase tracking-[0.14em] text-xs text-zinc-300">
                      <Store size={15} className="text-brand-cyan" /> {sponsor.category}
                    </span>
                  )}
                  {sponsor.location && (
                    <span className="inline-flex items-center gap-2 border-2 border-ink-800 px-4 py-2 font-condensed font-extrabold uppercase tracking-[0.14em] text-xs text-zinc-300">
                      <MapPin size={15} className="text-brand-pink" /> {sponsor.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-ink-900 border-b-2 border-ink-800">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <Reveal>
              <h2 className="font-display uppercase text-3xl sm:text-4xl mb-6">About {sponsor.name}</h2>
              <p className="text-zinc-300 text-lg leading-relaxed max-w-3xl">{sponsor.blurb}</p>
              {sponsor.website && (
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="sponsor-website"
                  className="inline-flex items-center gap-3 mt-10 font-anton uppercase tracking-widest text-base px-8 py-4 bg-brand-yellow text-black hover:bg-brand-cyan transition-colors shadow-[5px_5px_0px_#ec4899]"
                >
                  Visit Website <ArrowUpRight size={20} />
                </a>
              )}
            </Reveal>
          </div>

          <div>
            <Reveal delay={0.1}>
              <div className="border-2 border-brand-yellow bg-black p-8 h-full">
                <Trophy className="text-brand-yellow mb-4" size={34} />
                <p className="font-condensed font-extrabold uppercase tracking-[0.14em] text-brand-cyan text-xs">
                  Sponsorship
                </p>
                <p className="font-display uppercase text-2xl leading-none mt-2">{sponsor.tier}</p>
                {sponsor.note && <p className="text-zinc-400 mt-4">Backing the {sponsor.note}.</p>}
                {!sponsor.note && (
                  <p className="text-zinc-400 mt-4">
                    Proud supporter of Moto Mayhem Rodeo and the next generation of young riders.
                  </p>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* OTHER SPONSORS */}
      <section className="py-16 bg-black">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
          <Reveal>
            <p className="font-condensed font-extrabold uppercase tracking-[0.14em] text-zinc-500 text-sm mb-6">
              More of the crew
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-px">
            {others.map((s) => (
              <Link
                key={s.id}
                to={`/sponsors/${s.id}`}
                className="group bg-ink-900 border-2 border-ink-800 p-7 hover:border-brand-cyan transition-colors"
              >
                <p className="font-display uppercase text-2xl leading-none group-hover:text-brand-cyan transition-colors">
                  {s.name}
                </p>
                <p className="font-condensed font-extrabold text-xs uppercase tracking-[0.14em] text-brand-pink mt-2">
                  {s.tier}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-ink-900 border-t-2 border-ink-800 text-center">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
          <Reveal>
            <h2 className="font-display uppercase text-4xl sm:text-6xl leading-[0.9]">
              Want To <span className="text-brand-pink">Sponsor</span> The Mayhem?
            </h2>
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 mt-8 font-anton uppercase tracking-widest text-lg px-10 py-5 bg-brand-yellow text-black hover:bg-brand-cyan transition-colors shadow-[6px_6px_0px_#ec4899]"
            >
              Become A Sponsor <ArrowRight size={22} />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
