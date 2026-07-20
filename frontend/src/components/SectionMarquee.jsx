import Marquee from "react-fast-marquee";

export default function SectionMarquee({ items, speed = 40, outline = true, direction = "left" }) {
  return (
    <div className="py-8 border-y-2 border-ink-800 bg-black overflow-hidden select-none">
      <Marquee speed={speed} direction={direction} gradient={false} autoFill>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-8 mx-8">
            <span
              className={`font-display uppercase text-5xl sm:text-7xl leading-none ${
                outline ? "text-outline-yellow" : "text-brand-pink"
              }`}
            >
              {item}
            </span>
            <span className="text-brand-cyan text-4xl">✕</span>
          </div>
        ))}
      </Marquee>
    </div>
  );
}
