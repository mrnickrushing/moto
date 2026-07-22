import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion";
import Kicker from "@/components/Kicker";
import { EVENT, CLASSES } from "@/data/rodeo";

const FAQS = [
  {
    q: "What is Moto Mayhem Rodeo?",
    a: "The first-ever dirt bike rodeo at Ed Hughes Memorial Arena — three rodeo-style events (Barrel Racing, Pole Whipping, and Single Stake) that combine the excitement of motocross with the tradition of rodeo.",
  },
  {
    q: "When and where is it?",
    a: `${EVENT.date} at ${EVENT.location}, ${EVENT.city}. Check-in opens at 9:00 AM, the mandatory safety meeting is at 10:00 AM, and riding starts at 12:00 PM.`,
  },
  {
    q: "How much does it cost to enter?",
    a: "$100 per rider covers all three events (Barrels, Pole Whipping, Single Stake) plus a custom MOTO Mayhem t-shirt. Pole Whipping is also available as a standalone $50 entry with a cash payout for 1st place.",
  },
  {
    q: "What classes can my rider enter?",
    a: `Classes run by bike size and age: ${CLASSES.map((c) => `${c.cc} ${c.label} (${c.age})`).join(", ")}. Riders can enter multiple classes if their age and bike size qualify.`,
  },
  {
    q: "What bikes and gear are required?",
    a: "50cc, 65cc, 85cc, and 110cc dirt bikes only — no paddle tires, no electric bikes, and engines must be stock (exhaust modifications are OK). Every rider needs a helmet, boots, pants, and a long sleeve shirt. Bikes and gear are checked at check-in.",
  },
  {
    q: "How is the event scored?",
    a: "Each of the three events is timed, and a rider's times are combined into one cumulative score. The top 3 in each class place 1st through 3rd, and the 1st place rider in each class wins a custom championship buckle. Knocking over a barrel or cone adds 5 seconds; going off course adds 10 seconds.",
  },
  {
    q: "How do I register?",
    a: `Head to the Register page and fill out the rider registration form. Pre-registration closed ${EVENT.regDeadline} — email us at ${EVENT.email} to check day-of availability.`,
  },
  {
    q: "How do I pay?",
    a: "Venmo or cash at check-in, or pay by card online when you register — card payments are processed securely through Stripe.",
  },
  {
    q: "My rider is 4–6 years old (50cc Pee-Wee) — can I be in the arena?",
    a: "Yes — parents are allowed in the arena for the 50cc (4–6) class only, and will be walked through where to stand at the safety meeting so nobody trips the timers.",
  },
  {
    q: "Can my business sponsor the event?",
    a: "Absolutely — sponsors make this event possible. Check out the Become a Sponsor page to get started.",
  },
];

function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className="border-2 border-ink-800 bg-black">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 hover:bg-ink-900 transition-colors"
      >
        <span className="font-display uppercase text-xl sm:text-2xl leading-tight">{q}</span>
        <ChevronDown
          size={22}
          className={`text-brand-yellow shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-6 text-zinc-300 text-base leading-relaxed">{a}</div>
      )}
    </div>
  );
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div data-testid="faq-page">
      <section className="pt-36 sm:pt-44 pb-14 bg-black border-b-2 border-ink-800">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
          <Reveal>
            <Kicker color="pink">Questions</Kicker>
            <h1 className="font-display uppercase text-6xl sm:text-8xl leading-[0.85]">
              Frequently <span className="text-brand-pink">Asked</span>
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="py-20 bg-ink-900">
        <div className="max-w-[900px] mx-auto px-5 sm:px-8">
          <Reveal className="space-y-px">
            {FAQS.map((item, i) => (
              <FaqItem
                key={item.q}
                q={item.q}
                a={item.a}
                open={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
              />
            ))}
          </Reveal>

          <Reveal delay={0.1} className="mt-14 text-center">
            <p className="text-zinc-400 text-lg mb-6">Still have a question?</p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 font-anton uppercase tracking-widest text-lg px-9 py-4 bg-brand-yellow text-black hover:bg-brand-cyan transition-colors shadow-[5px_5px_0px_#ec4899]"
            >
              Get In Touch <ArrowRight size={20} />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
