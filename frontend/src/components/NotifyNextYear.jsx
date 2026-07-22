import { useState } from "react";
import { Mail, ArrowRight, Check } from "lucide-react";
import { Reveal } from "@/components/motion";
import api, { formatApiErrorDetail } from "@/lib/api";

export default function NotifyNextYear() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/notify-next-year", { email });
      setDone(true);
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-ink-900 border-t-2 border-ink-800">
      <div className="max-w-[700px] mx-auto px-5 sm:px-8 text-center">
        <Reveal>
          <Mail className="text-brand-cyan mx-auto mb-4" size={30} />
          <h2 className="font-display uppercase text-3xl sm:text-4xl leading-none">
            Missed It? <span className="text-brand-cyan">Get Notified Next Year</span>
          </h2>
          <p className="text-zinc-400 mt-4">
            Drop your email and we'll let you know the moment Moto Mayhem Rodeo 2027 registration opens.
          </p>
          {done ? (
            <p data-testid="notify-success" className="inline-flex items-center gap-2 mt-7 font-condensed font-extrabold uppercase tracking-[0.14em] text-brand-yellow">
              <Check size={18} /> You're on the list!
            </p>
          ) : (
            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 mt-7 max-w-md mx-auto" data-testid="notify-next-year-form">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                data-testid="notify-email"
                className="flex-1 bg-black border-2 border-ink-800 px-4 py-3 text-white font-mono focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-pink transition-colors placeholder:text-zinc-600"
              />
              <button
                type="submit"
                disabled={loading}
                data-testid="notify-submit"
                className="inline-flex items-center justify-center gap-2 font-anton uppercase tracking-widest px-6 py-3 bg-brand-yellow text-black hover:bg-brand-cyan transition-colors shadow-[4px_4px_0px_#ec4899] disabled:opacity-50"
              >
                {loading ? "Saving…" : "Notify Me"} <ArrowRight size={18} />
              </button>
            </form>
          )}
          {error && <p className="text-brand-pink font-mono text-sm mt-3">{error}</p>}
        </Reveal>
      </div>
    </section>
  );
}
