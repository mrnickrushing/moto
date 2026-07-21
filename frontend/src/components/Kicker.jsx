// Kicker — a small angled "race number-plate" section label.
// Replaces the old "/ mono cyan" eyebrow so section labels read like a
// moto race poster instead of a dev portfolio.
const STYLES = {
  yellow: "bg-brand-yellow text-black",
  pink: "bg-brand-pink text-white",
  cyan: "bg-brand-cyan text-black",
  orange: "bg-brand-orange text-black",
  cream: "bg-brand-cream text-black",
};

export default function Kicker({ children, color = "yellow", className = "" }) {
  const style = STYLES[color] || STYLES.yellow;
  return (
    <span
      className={`inline-block -skew-x-[14deg] border-2 border-black shadow-[3px_3px_0_#080a09] px-3 py-1 mb-4 ${style} ${className}`}
    >
      <span className="inline-block skew-x-[14deg] font-condensed font-extrabold uppercase text-xs sm:text-sm tracking-[0.14em] leading-none">
        {children}
      </span>
    </span>
  );
}
