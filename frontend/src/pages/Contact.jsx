import { useState } from "react";
import { toast } from "sonner";
import { Mail, MapPin, Calendar, Facebook, Send } from "lucide-react";
import { Reveal } from "@/components/motion";
import Kicker from "@/components/Kicker";
import api, { formatApiErrorDetail } from "@/lib/api";
import { EVENT } from "@/data/rodeo";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/contact", form);
      toast.success("Message sent! We'll be in touch.");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const field = "w-full bg-black border-2 border-ink-800 px-4 py-3 text-white font-mono focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-pink transition-colors placeholder:text-zinc-600";

  return (
    <div data-testid="contact-page">
      <section className="pt-36 sm:pt-44 pb-14 bg-black border-b-2 border-ink-800">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
          <Reveal>
            <Kicker color="cyan">Get In Touch</Kicker>
            <h1 className="font-display uppercase text-6xl sm:text-8xl leading-[0.85]">
              Holler <span className="text-brand-pink">At Us</span>
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="py-20 bg-ink-900">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-14">
          <Reveal>
            <form onSubmit={submit} data-testid="contact-form" className="space-y-6">
              <div>
                <label htmlFor="contact-name" className="font-mono uppercase text-xs tracking-widest text-zinc-400 block mb-2">Name</label>
                <input id="contact-name" data-testid="contact-name" autoComplete="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} placeholder="Your name" />
              </div>
              <div>
                <label htmlFor="contact-email" className="font-mono uppercase text-xs tracking-widest text-zinc-400 block mb-2">Email</label>
                <input id="contact-email" data-testid="contact-email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={field} placeholder="you@email.com" />
              </div>
              <div>
                <label htmlFor="contact-message" className="font-mono uppercase text-xs tracking-widest text-zinc-400 block mb-2">Message</label>
                <textarea id="contact-message" data-testid="contact-message" required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={field} placeholder="Sponsorship, questions, mayhem…" />
              </div>
              <button
                data-testid="contact-submit"
                disabled={loading}
                className="inline-flex items-center gap-3 font-anton uppercase tracking-widest text-lg px-10 py-4 bg-brand-yellow text-black hover:bg-brand-cyan transition-colors shadow-[5px_5px_0px_#ec4899] disabled:opacity-50"
              >
                {loading ? "Sending…" : "Send Message"} <Send size={20} />
              </button>
            </form>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-px">
              {[
                { icon: Mail, label: "Email", value: EVENT.email, href: `mailto:${EVENT.email}` },
                { icon: Facebook, label: "Facebook", value: "Follow The Mayhem", href: EVENT.facebook, external: true },
                { icon: MapPin, label: "Location", value: `${EVENT.location}, ${EVENT.city}` },
                { icon: Calendar, label: "Event Date", value: EVENT.date },
              ].map((it, i) => (
                <div key={i} className="bg-black border-2 border-ink-800 p-8 flex items-start gap-5 hover:border-brand-yellow transition-colors">
                  <it.icon className="text-brand-pink shrink-0" size={28} />
                  <div>
                    <p className="font-mono uppercase text-xs tracking-widest text-zinc-500">{it.label}</p>
                    {it.href ? (
                      <a
                        href={it.href}
                        {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="font-display uppercase text-2xl leading-none mt-1 block break-all hover:text-brand-yellow transition-colors"
                      >{it.value}</a>
                    ) : (
                      <p className="font-display uppercase text-2xl leading-none mt-1">{it.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
