import { useState } from "react";
import { toast } from "sonner";
import { Banknote, ArrowRight, Check } from "lucide-react";
import { Reveal } from "@/components/motion";
import Kicker from "@/components/Kicker";
import api, { formatApiErrorDetail } from "@/lib/api";
import { CLASSES, TSHIRT_SIZES, EVENT, accentClass } from "@/data/rodeo";

const empty = {
  rider_name: "",
  date_of_birth: "",
  age: "",
  tshirt_size: "",
  parent_guardian: "",
  email: "",
  phone: "",
  emergency_name: "",
  emergency_relationship: "",
  emergency_phone: "",
};

export default function Register() {
  const [form, setForm] = useState(empty);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const total = selected.length * EVENT.price;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const field = "w-full bg-black border-2 border-ink-800 px-4 py-3 text-white font-mono focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-pink transition-colors placeholder:text-zinc-600";
  const labelCls = "font-mono uppercase text-xs tracking-widest text-zinc-400 block mb-2";

  const toggleClass = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const submit = async (e) => {
    e.preventDefault();
    if (selected.length < 1) {
      toast.error("Select at least one class to enter.");
      return;
    }
    if (!form.tshirt_size) {
      toast.error("Pick a t-shirt size.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        classes: selected.map((id) => {
          const c = CLASSES.find((x) => x.id === id);
          return `${c.cc} ${c.label} (${c.age})`;
        }),
        payment_method: "venmo_cash",
      };
      await api.post("/registrations", payload);

      toast.success("Spot reserved! Pay via Venmo or cash at check-in.");
      setForm(empty);
      setSelected([]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="register-page">
      <section className="pt-36 sm:pt-44 pb-14 bg-black border-b-2 border-ink-800">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
          <Reveal>
            <Kicker color="yellow">Rider Registration</Kicker>
            <h1 className="font-display uppercase text-6xl sm:text-8xl leading-[0.85]">
              Lock Your <span className="text-brand-pink">Spot</span>
            </h1>
            <p className="text-zinc-400 text-lg mt-6 max-w-2xl">
              ${EVENT.price} per entry · 3 events (Barrels · Poles · Single Stake) + custom t-shirt.
              Pre-registration due {EVENT.regDeadline}.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 bg-ink-900">
        <form onSubmit={submit} data-testid="register-form" className="max-w-[1400px] mx-auto px-5 sm:px-8 grid lg:grid-cols-3 gap-8">
          {/* LEFT: form */}
          <div className="lg:col-span-2 space-y-12">
            {/* classes */}
            <div>
              <h2 className="font-display uppercase text-3xl mb-6">1. Choose Classes</h2>
              <div className="grid sm:grid-cols-2 gap-px" data-testid="class-selector">
                {CLASSES.map((c) => {
                  const active = selected.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      data-testid={`class-option-${c.id}`}
                      onClick={() => toggleClass(c.id)}
                      className={`text-left border-2 p-5 transition-colors ${
                        active ? "border-brand-yellow bg-brand-yellow/10" : "border-ink-800 bg-black hover:border-brand-cyan"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-mono font-extrabold text-2xl ${accentClass[c.accent]}`}>{c.cc}</span>
                        <span className={`w-6 h-6 border-2 flex items-center justify-center ${active ? "border-brand-yellow bg-brand-yellow" : "border-ink-800"}`}>
                          {active && <Check size={16} className="text-black" />}
                        </span>
                      </div>
                      <p className="font-anton uppercase text-lg mt-3 leading-none">{c.label}</p>
                      <p className="font-mono text-xs text-zinc-500 mt-1">Ages {c.age}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* rider info */}
            <div>
              <h2 className="font-display uppercase text-3xl mb-6">2. Rider Info</h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Rider Name</label>
                  <input data-testid="rider-name" required value={form.rider_name} onChange={set("rider_name")} className={field} placeholder="Rider full name" />
                </div>
                <div>
                  <label className={labelCls}>Date of Birth</label>
                  <input data-testid="rider-dob" required value={form.date_of_birth} onChange={set("date_of_birth")} className={field} placeholder="MM/DD/YYYY" />
                </div>
                <div>
                  <label className={labelCls}>Age (as of Jan 1, 2026)</label>
                  <input data-testid="rider-age" required value={form.age} onChange={set("age")} className={field} placeholder="e.g. 9" />
                </div>
                <div>
                  <label className={labelCls}>T-Shirt Size</label>
                  <select data-testid="tshirt-size" value={form.tshirt_size} onChange={set("tshirt_size")} className={field}>
                    <option value="">Select size</option>
                    {TSHIRT_SIZES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Parent / Guardian</label>
                  <input data-testid="parent-guardian" value={form.parent_guardian} onChange={set("parent_guardian")} className={field} placeholder="If rider is a minor" />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input data-testid="rider-email" type="email" required value={form.email} onChange={set("email")} className={field} placeholder="you@email.com" />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input data-testid="rider-phone" required value={form.phone} onChange={set("phone")} className={field} placeholder="(000) 000-0000" />
                </div>
              </div>
            </div>

            {/* emergency */}
            <div>
              <h2 className="font-display uppercase text-3xl mb-6">3. Emergency Contact</h2>
              <div className="grid sm:grid-cols-3 gap-5">
                <div>
                  <label className={labelCls}>Name</label>
                  <input data-testid="emergency-name" required value={form.emergency_name} onChange={set("emergency_name")} className={field} placeholder="Contact name" />
                </div>
                <div>
                  <label className={labelCls}>Relationship</label>
                  <input data-testid="emergency-relationship" required value={form.emergency_relationship} onChange={set("emergency_relationship")} className={field} placeholder="e.g. Parent" />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input data-testid="emergency-phone" required value={form.emergency_phone} onChange={set("emergency_phone")} className={field} placeholder="(000) 000-0000" />
                </div>
              </div>
            </div>

            {/* payment method */}
            <div>
              <h2 className="font-display uppercase text-3xl mb-6">4. Payment</h2>
              <div className="border-2 border-brand-yellow bg-brand-yellow/5 p-6" data-testid="pay-venmo-cash">
                <Banknote className="text-brand-pink mb-3" size={28} />
                <p className="font-anton uppercase text-xl leading-none">Venmo / Cash at Check-In</p>
                <p className="font-mono text-sm text-zinc-400 mt-3 leading-relaxed">
                  Reserve your spot now — no online payment required. Bring your{" "}
                  <span className="text-brand-yellow font-bold">${EVENT.price} per entry</span> as
                  Venmo or cash when you check in on event day. We'll confirm your entries by email.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-28 border-2 border-brand-yellow bg-black p-8" data-testid="order-summary">
              <Kicker color="cyan" className="mb-6">Entry Summary</Kicker>
              <div className="space-y-3 mb-6 min-h-[60px]">
                {selected.length === 0 ? (
                  <p className="text-zinc-600 font-mono text-sm">No classes selected yet.</p>
                ) : (
                  selected.map((id) => {
                    const c = CLASSES.find((x) => x.id === id);
                    return (
                      <div key={id} className="flex justify-between text-sm border-b border-ink-800 pb-2">
                        <span className="text-zinc-300">{c.cc} {c.label}</span>
                        <span className="font-mono text-brand-yellow">${EVENT.price}</span>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex justify-between items-end border-t-2 border-ink-800 pt-5">
                <span className="font-mono uppercase text-xs tracking-widest text-zinc-400">Total ({selected.length} entries)</span>
                <span className="font-mono font-extrabold text-4xl text-brand-yellow" data-testid="total-amount">${total}</span>
              </div>
              <button
                type="submit"
                data-testid="register-submit"
                disabled={loading}
                className="w-full mt-8 inline-flex items-center justify-center gap-3 font-anton uppercase tracking-widest text-lg px-6 py-4 bg-brand-yellow text-black hover:bg-brand-cyan transition-colors shadow-[5px_5px_0px_#ec4899] disabled:opacity-50"
              >
                {loading ? "Processing…" : "Reserve Spot"}
                <ArrowRight size={20} />
              </button>
              <p className="font-mono text-[10px] text-zinc-600 mt-4 text-center uppercase tracking-widest">
                All riders must wear a helmet + proper gear
              </p>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
