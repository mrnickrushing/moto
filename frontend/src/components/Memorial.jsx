import { Reveal } from "@/components/motion";
import Kicker from "@/components/Kicker";
import { MEMORIAL, EVENT } from "@/data/rodeo";

export default function Memorial() {
  const m = MEMORIAL;
  const [first, ...restName] = m.name.split(" ");
  const last = restName.join(" ");

  return (
    <section
      data-testid="memorial-section"
      className="relative py-20 sm:py-28 bg-black border-y-2 border-ink-800 overflow-hidden"
    >
      <div className="absolute inset-0 diag-lines opacity-20" aria-hidden="true" />
      <div className="relative max-w-[1400px] mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Poster */}
        <Reveal>
          <div className="mx-auto max-w-md border-2 border-brand-pink poster-shadow-pink bg-black">
            <img
              src={m.image}
              alt={`In loving memory of ${m.name}, race number ${m.number}`}
              className="w-full h-auto block"
              loading="lazy"
              width="1024"
              height="1536"
            />
          </div>
        </Reveal>

        {/* Tribute */}
        <Reveal delay={0.1}>
          <div>
            <Kicker color="pink">In Loving Memory</Kicker>
            <h2 className="font-display uppercase text-6xl sm:text-8xl leading-[0.82] mt-1">
              {first}
              <br />
              <span className="text-brand-pink">{last}</span>
            </h2>
            <p className="font-condensed font-extrabold uppercase tracking-[0.16em] text-brand-cyan text-lg sm:text-xl mt-5">
              #{m.number} &middot; {m.born} &ndash; {m.died}
            </p>

            <p className="text-zinc-300 text-lg mt-7 max-w-xl leading-relaxed">
              This year's {EVENT.name} rides in honor of {m.name}. {m.lines.join(" ")}
            </p>

            <p className="font-brush text-brand-yellow text-3xl sm:text-4xl -rotate-2 mt-9 max-w-md leading-tight">
              {m.quote}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
