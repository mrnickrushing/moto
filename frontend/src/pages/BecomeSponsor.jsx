import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Handshake } from "lucide-react";
import { Reveal } from "@/components/motion";
import Kicker from "@/components/Kicker";
import api, { formatApiErrorDetail } from "@/lib/api";

const TIERS = [
  "Champion Buckle Sponsor",
  "Gold Sponsor",
  "Silver Sponsor",
  "Community Partner",
  "Not sure yet",
];

const empty = {
  business_name: "",
  contact_name: "",
  email: "",
  phone: "",
  tier: "Not sure yet",
  message: "",
};

export default function BecomeSponsor() {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const field =
    "w-full bg-black border-2 border-ink-800 px-4 py-3 text-white font-mono focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-pink transition-colors placeholder:text-zinc-600";
  const labelCls =
    "font-mono uppercase text-xs tracking-widest text-zinc-400 block mb-2";

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/sponsor-inquiry", form);
      toast.success("Thanks for backing the mayhem! We'll be in touch soon.");
      setForm(empty);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="become-sponsor-page">
      <section className="pt-36 sm:pt-44 pb-14 bg-black border-b-2 border-ink-800">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
          <Reveal>
            <Kicker color="pink">Become A Sponsor</Kicker>
            <h1 className="font-display uppercase text-6xl sm:text-8xl leading-[0.85]">
              Back The <span className="text-brand-yellow">Mayhem</span>
            </h1>
            <p className="text-zinc-400 text-lg mt-6 max-w-2xl">
              Get your business in front of the whole riding community and give young riders the chance
              to compete for a championship buckle. Fill this out and we'll be in touch soon.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 bg-ink-900">
        <div className="max-w-[900px] mx-auto px-5 sm:px-8">
          <form onSubmit={submit} data-testid="sponsor-form" className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="business_name" className={labelCls}>Business Name</label>
                <input id="business_name" data-testid="sponsor-business" required value={form.business_name} onChange={set("business_name")} className={field} placeholder="Your business" />
              </div>
              <div>
                <label htmlFor="contact_name" className={labelCls}>Contact Name</label>
                <input id="contact_name" data-testid="sponsor-contact-name" autoComplete="name" required value={form.contact_name} onChange={set("contact_name")} className={field} placeholder="Your name" />
              </div>
              <div>
                <label htmlFor="sponsor_email" className={labelCls}>Email</label>
                <input id="sponsor_email" data-testid="sponsor-email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} className={field} placeholder="you@business.com" />
              </div>
              <div>
                <label htmlFor="sponsor_phone" className={labelCls}>Phone</label>
                <input id="sponsor_phone" data-testid="sponsor-phone" type="tel" autoComplete="tel" required value={form.phone} onChange={set("phone")} className={field} placeholder="(000) 000-0000" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="sponsor_tier" className={labelCls}>Sponsorship Level</label>
                <select id="sponsor_tier" data-testid="sponsor-tier" value={form.tier} onChange={set("tier")} className={field}>
                  {TIERS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="sponsor_message" className={labelCls}>Message (optional)</label>
                <textarea id="sponsor_message" data-testid="sponsor-message" rows={5} value={form.message} onChange={set("message")} className={field} placeholder="Tell us how you'd like to support the event." />
              </div>
            </div>

            <div className="flex items-center gap-4 border-2 border-brand-yellow bg-brand-yellow/5 p-6">
              <Handshake className="text-brand-pink shrink-0" size={30} />
              <p className="font-mono text-sm text-zinc-300">
                Sponsors make Moto Mayhem Rodeo possible. We'll follow up personally to lock in your
                shout-out and any custom details.
              </p>
            </div>

            <button
              type="submit"
              data-testid="sponsor-submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-3 font-anton uppercase tracking-widest text-lg px-6 py-4 bg-brand-yellow text-black hover:bg-brand-cyan transition-colors shadow-[5px_5px_0px_#ec4899] disabled:opacity-50"
            >
              {loading ? "Sending…" : "Submit Sponsorship Interest"}
              <ArrowRight size={20} />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
