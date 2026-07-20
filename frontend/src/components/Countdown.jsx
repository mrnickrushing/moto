import { useState, useEffect } from "react";
import { EVENT } from "@/data/rodeo";

function diff(target) {
  const now = new Date().getTime();
  const d = Math.max(0, target - now);
  return {
    days: Math.floor(d / (1000 * 60 * 60 * 24)),
    hours: Math.floor((d / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((d / (1000 * 60)) % 60),
    seconds: Math.floor((d / 1000) % 60),
  };
}

export default function Countdown({ compact = false }) {
  const target = new Date(EVENT.dateISO).getTime();
  const [t, setT] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const units = [
    { v: t.days, l: "Days", c: "text-brand-yellow" },
    { v: t.hours, l: "Hrs", c: "text-brand-pink" },
    { v: t.minutes, l: "Min", c: "text-brand-cyan" },
    { v: t.seconds, l: "Sec", c: "text-brand-yellow" },
  ];

  return (
    <div data-testid="countdown" className={`flex ${compact ? "gap-4" : "gap-4 sm:gap-8"}`}>
      {units.map((u, i) => (
        <div key={i} className="flex flex-col items-center">
          <span
            className={`font-mono font-extrabold tabular-nums ${u.c} ${
              compact ? "text-3xl sm:text-4xl" : "text-5xl sm:text-7xl"
            }`}
            data-testid={`countdown-${u.l.toLowerCase()}`}
          >
            {String(u.v).padStart(2, "0")}
          </span>
          <span className="font-mono uppercase tracking-[0.3em] text-[10px] sm:text-xs text-zinc-500 mt-1">
            {u.l}
          </span>
        </div>
      ))}
    </div>
  );
}
