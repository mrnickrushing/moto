import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, Users, DollarSign, Ticket, Clock, Trash2, Check, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

function Stat({ icon: Icon, label, value, accent }) {
  return (
    <div className="border-2 border-ink-800 bg-black p-6" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <Icon className={accent} size={26} />
      <p className="font-mono font-extrabold text-4xl mt-4 tabular-nums">{value}</p>
      <p className="font-mono uppercase text-[10px] tracking-[0.2em] text-zinc-500 mt-1">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [regs, setRegs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [r, s] = await Promise.all([
        api.get("/admin/registrations"),
        api.get("/admin/stats"),
      ]);
      setRegs(r.data);
      setStats(s.data);
    } catch (e) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const doLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const togglePaid = async (reg) => {
    const next = reg.payment_status === "paid" ? "pending" : "paid";
    try {
      await api.patch(`/admin/registrations/${reg.id}`, { payment_status: next });
      toast.success(`Marked ${next}`);
      load();
    } catch (e) {
      toast.error("Update failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this registration?")) return;
    try {
      await api.delete(`/admin/registrations/${id}`);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  return (
    <div data-testid="admin-dashboard" className="min-h-screen bg-ink-950">
      <div className="noise-overlay" />
      <header className="border-b-2 border-ink-800 bg-black sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-display uppercase text-2xl">
              <span className="text-brand-yellow">MOTO</span>
              <span className="text-brand-pink">MAYHEM</span>
            </Link>
            <span className="font-mono uppercase text-xs tracking-[0.2em] text-zinc-500 hidden sm:inline">/ Admin</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="font-mono text-xs text-zinc-500 hidden sm:inline">{user?.email}</span>
            <button data-testid="admin-logout" onClick={doLogout} className="flex items-center gap-2 font-mono uppercase text-xs tracking-widest text-zinc-300 hover:text-brand-pink transition-colors">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-5 sm:px-8 py-10">
        <h1 className="font-display uppercase text-5xl sm:text-6xl leading-none mb-8">Registrations</h1>

        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-px mb-10">
            <Stat icon={Users} label="Total Riders" value={stats.total_riders} accent="text-brand-cyan" />
            <Stat icon={Ticket} label="Total Entries" value={stats.total_entries} accent="text-brand-yellow" />
            <Stat icon={Check} label="Paid" value={stats.paid_count} accent="text-brand-yellow" />
            <Stat icon={Clock} label="Pending" value={stats.pending_count} accent="text-brand-pink" />
            <Stat icon={DollarSign} label="Revenue" value={`$${stats.revenue}`} accent="text-brand-cyan" />
          </div>
        )}

        {loading ? (
          <p className="font-mono uppercase tracking-widest text-brand-yellow animate-pulse">Loading…</p>
        ) : regs.length === 0 ? (
          <div className="border-2 border-ink-800 p-16 text-center">
            <p className="font-mono uppercase tracking-widest text-zinc-500">No registrations yet.</p>
          </div>
        ) : (
          <div className="border-2 border-ink-800 overflow-x-auto" data-testid="registrations-table">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black font-mono uppercase text-[10px] tracking-[0.2em] text-zinc-500">
                  <th className="p-4">Rider</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Classes</th>
                  <th className="p-4">Method</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {regs.map((r) => (
                  <tr key={r.id} data-testid={`reg-row-${r.id}`} className="border-t border-ink-800 hover:bg-black/50 transition-colors align-top">
                    <td className="p-4">
                      <p className="font-bold text-white">{r.rider_name}</p>
                      <p className="font-mono text-xs text-zinc-500">Age {r.age} · {r.tshirt_size}</p>
                    </td>
                    <td className="p-4 text-sm text-zinc-400">
                      <p className="break-all">{r.email}</p>
                      <p className="font-mono text-xs">{r.phone}</p>
                    </td>
                    <td className="p-4 text-sm text-zinc-300 max-w-[220px]">
                      {(r.classes || []).map((c, i) => (
                        <span key={i} className="block font-mono text-xs">{c}</span>
                      ))}
                    </td>
                    <td className="p-4 font-mono text-xs uppercase text-zinc-400">
                      {r.payment_method === "stripe" ? "Card" : "Venmo/Cash"}
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-brand-yellow">${r.total}</td>
                    <td className="p-4">
                      <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 border ${r.payment_status === "paid" ? "border-brand-yellow text-brand-yellow" : "border-brand-pink text-brand-pink"}`}>
                        {r.payment_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          data-testid={`toggle-paid-${r.id}`}
                          onClick={() => togglePaid(r)}
                          title="Toggle paid"
                          className="w-9 h-9 border-2 border-ink-800 flex items-center justify-center hover:border-brand-yellow hover:text-brand-yellow transition-colors"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          data-testid={`delete-${r.id}`}
                          onClick={() => remove(r.id)}
                          title="Delete"
                          className="w-9 h-9 border-2 border-ink-800 flex items-center justify-center hover:border-brand-pink hover:text-brand-pink transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Link to="/" className="inline-flex items-center gap-2 mt-8 font-mono uppercase text-xs tracking-widest text-brand-cyan hover:text-brand-yellow transition-colors">
          View public site <ExternalLink size={14} />
        </Link>
      </main>
    </div>
  );
}
