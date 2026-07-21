import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, KeyRound, UserPlus, Trash2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api, { formatApiErrorDetail } from "@/lib/api";

const field =
  "w-full bg-black border-2 border-ink-800 px-4 py-3 text-white font-mono focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-pink transition-colors placeholder:text-zinc-600";
const labelCls =
  "font-mono uppercase text-xs tracking-widest text-zinc-400 block mb-2";
const btn =
  "inline-flex items-center justify-center gap-2 font-anton uppercase tracking-widest px-6 py-3 bg-brand-yellow text-black hover:bg-brand-cyan transition-colors shadow-[4px_4px_0px_#ec4899] disabled:opacity-50";

const MIN_PW = 14;

function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (next.length < MIN_PW) {
      toast.error(`New password must be at least ${MIN_PW} characters.`);
      return;
    }
    if (next !== confirm) {
      toast.error("New password and confirmation don't match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/change-password", {
        current_password: current,
        new_password: next,
      });
      toast.success("Password updated.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="border-2 border-ink-800 bg-black p-6 sm:p-8" data-testid="change-password-card">
      <div className="flex items-center gap-3 mb-6">
        <KeyRound className="text-brand-yellow" size={22} />
        <h2 className="font-display uppercase text-3xl leading-none">Change Password</h2>
      </div>
      <form onSubmit={submit} className="space-y-5 max-w-md" data-testid="change-password-form">
        <div>
          <label htmlFor="current_password" className={labelCls}>Current Password</label>
          <input id="current_password" data-testid="current-password" type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} className={field} placeholder="••••••••" />
        </div>
        <div>
          <label htmlFor="new_password" className={labelCls}>New Password</label>
          <input id="new_password" data-testid="new-password" type="password" autoComplete="new-password" required minLength={MIN_PW} value={next} onChange={(e) => setNext(e.target.value)} className={field} placeholder={`At least ${MIN_PW} characters`} />
        </div>
        <div>
          <label htmlFor="confirm_password" className={labelCls}>Confirm New Password</label>
          <input id="confirm_password" data-testid="confirm-password" type="password" autoComplete="new-password" required minLength={MIN_PW} value={confirm} onChange={(e) => setConfirm(e.target.value)} className={field} placeholder="Re-enter new password" />
        </div>
        <button type="submit" data-testid="change-password-submit" disabled={loading} className={btn}>
          {loading ? "Saving…" : "Update Password"}
        </button>
      </form>
    </section>
  );
}

const emptyAdmin = { name: "", email: "", password: "" };

function AdminUsers() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyAdmin);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users");
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const add = async (e) => {
    e.preventDefault();
    if (form.password.length < MIN_PW) {
      toast.error(`Password must be at least ${MIN_PW} characters.`);
      return;
    }
    setAdding(true);
    try {
      await api.post("/admin/users", form);
      toast.success(`Added ${form.email}`);
      setForm(emptyAdmin);
      load();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setAdding(false);
    }
  };

  const remove = async (a) => {
    if (!window.confirm(`Remove admin ${a.email}?`)) return;
    try {
      await api.delete(`/admin/users/${a.id}`);
      toast.success("Admin removed");
      load();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    }
  };

  const currentEmail = (user?.email || "").toLowerCase();

  return (
    <section className="border-2 border-ink-800 bg-black p-6 sm:p-8" data-testid="admin-users-card">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="text-brand-cyan" size={22} />
        <h2 className="font-display uppercase text-3xl leading-none">Admin Users</h2>
      </div>

      {loading ? (
        <p className="font-mono uppercase tracking-widest text-brand-yellow animate-pulse">Loading…</p>
      ) : (
        <div className="border-2 border-ink-800 overflow-x-auto mb-8" data-testid="admin-users-table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ink-900 font-mono uppercase text-[10px] tracking-[0.2em] text-zinc-500">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => {
                const isSelf = a.email?.toLowerCase() === currentEmail;
                return (
                  <tr key={a.id} data-testid={`admin-row-${a.id}`} className="border-t border-ink-800 align-middle">
                    <td className="p-4 font-bold text-white">
                      {a.name}
                      {isSelf && <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-brand-yellow">You</span>}
                    </td>
                    <td className="p-4 text-sm text-zinc-400 break-all">{a.email}</td>
                    <td className="p-4 text-right">
                      <button
                        data-testid={`remove-admin-${a.id}`}
                        onClick={() => remove(a)}
                        disabled={isSelf}
                        title={isSelf ? "You can't remove your own account" : "Remove admin"}
                        className="w-9 h-9 inline-flex items-center justify-center border-2 border-ink-800 hover:border-brand-pink hover:text-brand-pink transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-ink-800 disabled:hover:text-current"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <UserPlus className="text-brand-pink" size={18} />
        <h3 className="font-mono uppercase text-xs tracking-widest text-zinc-300">Add New Admin</h3>
      </div>
      <form onSubmit={add} className="grid sm:grid-cols-2 gap-5 max-w-2xl" data-testid="add-admin-form">
        <div>
          <label htmlFor="new_admin_name" className={labelCls}>Name</label>
          <input id="new_admin_name" data-testid="new-admin-name" autoComplete="name" required value={form.name} onChange={set("name")} className={field} placeholder="Full name" />
        </div>
        <div>
          <label htmlFor="new_admin_email" className={labelCls}>Email</label>
          <input id="new_admin_email" data-testid="new-admin-email" type="email" autoComplete="off" required value={form.email} onChange={set("email")} className={field} placeholder="name@email.com" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="new_admin_password" className={labelCls}>Temporary Password</label>
          <input id="new_admin_password" data-testid="new-admin-password" type="password" autoComplete="new-password" required minLength={MIN_PW} value={form.password} onChange={set("password")} className={field} placeholder={`At least ${MIN_PW} characters`} />
          <p className="font-mono text-[11px] text-zinc-500 mt-2">
            Share this with the new admin — they can change it here after signing in.
          </p>
        </div>
        <div className="sm:col-span-2">
          <button type="submit" data-testid="add-admin-submit" disabled={adding} className={btn}>
            {adding ? "Adding…" : "Add Admin"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default function AdminSettings() {
  return (
    <div data-testid="admin-settings" className="min-h-screen bg-ink-950">
      <div className="noise-overlay" />
      <header className="border-b-2 border-ink-800 bg-black sticky top-0 z-40">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="font-display uppercase text-2xl">
            <span className="text-brand-yellow">MOTO</span>
            <span className="text-brand-pink">MAYHEM</span>
          </Link>
          <Link to="/admin" data-testid="back-to-admin" className="inline-flex items-center gap-2 font-mono uppercase text-xs tracking-widest text-zinc-300 hover:text-brand-cyan transition-colors">
            <ArrowLeft size={16} /> Back to Admin
          </Link>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-5 sm:px-8 py-10">
        <h1 className="font-display uppercase text-5xl sm:text-6xl leading-none mb-8">Settings</h1>
        <div className="space-y-8">
          <ChangePassword />
          <AdminUsers />
        </div>
      </main>
    </div>
  );
}
