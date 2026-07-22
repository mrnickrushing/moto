import { Reveal } from "@/components/motion";
import Kicker from "@/components/Kicker";
import { EVENT } from "@/data/rodeo";

function Section({ title, children }) {
  return (
    <Reveal className="mb-14">
      <h2 className="font-display uppercase text-2xl sm:text-3xl leading-none mb-4 text-brand-yellow">{title}</h2>
      <div className="text-zinc-300 text-base leading-relaxed space-y-4">{children}</div>
    </Reveal>
  );
}

export default function Privacy() {
  return (
    <div data-testid="privacy-page">
      <section className="pt-36 sm:pt-44 pb-14 bg-black border-b-2 border-ink-800">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
          <Reveal>
            <Kicker color="cyan">Legal</Kicker>
            <h1 className="font-display uppercase text-6xl sm:text-8xl leading-[0.85]">
              Privacy <span className="text-brand-cyan">Policy</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-6 font-mono uppercase tracking-widest">Last updated July 2026</p>
          </Reveal>
        </div>
      </section>

      <section className="py-20 bg-ink-900">
        <div className="max-w-[800px] mx-auto px-5 sm:px-8">
          <Section title="What We Collect">
            <p>When you register a rider, we collect the rider's name, date of birth, t-shirt size, class selections, parent/guardian name, email, phone number, and emergency contact information. This is the same information a paper registration packet would ask for — we just collect it online.</p>
            <p>If you contact us or inquire about sponsoring, we collect the name, email, phone number, and message you provide.</p>
            <p>If you're an event admin, we store your email, name, and a securely hashed password (never the password itself). If you enable two-factor authentication, we store a hashed copy of your authenticator secret and backup codes — never in a form that could be used to sign in as you if our database were ever exposed.</p>
          </Section>

          <Section title="How We Use It">
            <p>Registration information is used to run the event: assigning back numbers, checking gear and age eligibility, contacting a parent/guardian, and reaching an emergency contact if needed on race day. We do not use it for anything else, and we do not sell or rent it to anyone.</p>
          </Section>

          <Section title="Payments">
            <p>Entry fees can be paid by Venmo/cash at check-in or by card online. Card payments are processed entirely by Stripe — we never see or store your card number. Stripe's own privacy practices apply to that transaction.</p>
          </Section>

          <Section title="Who Can See It">
            <p>Registration, contact, and sponsor inquiry data is only visible to Moto Mayhem Rodeo event admins, who sign in with a password (and optionally two-factor authentication) to a private admin dashboard. Every admin action on this data — edits, deletions, account changes — is logged with who did it and when.</p>
          </Section>

          <Section title="Error Monitoring">
            <p>Like most modern websites, we use an error-monitoring service (Sentry) to catch and fix bugs. It's configured to strip cookies, form data, and personal information before anything is sent — it tells us "this page threw an error," not who was using it.</p>
          </Section>

          <Section title="How Long We Keep It">
            <p>We keep registration and sponsor records for our own event records and to contact you about future MOTO Mayhem Rodeo events. If you'd like your information removed, email us and we'll take care of it.</p>
          </Section>

          <Section title="Questions">
            <p>
              This is a small, locally-run event — if you have any question about your data, just ask.
              Email{" "}
              <a href={`mailto:${EVENT.email}`} className="text-brand-cyan hover:text-brand-yellow transition-colors">
                {EVENT.email}
              </a>.
            </p>
          </Section>
        </div>
      </section>
    </div>
  );
}
