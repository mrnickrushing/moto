import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, KeyRound, UserPlus, Trash2, ShieldCheck, Mail, Clock, ScrollText, Smartphone, Copy, Check } from "lucide-react";
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

function TwoFactorAuth() {
  const { user, setUser } = useAuth();
  const [stage, setStage] = useState("idle"); // idle | setting-up | backup-codes | disabling
  const [qrSvg, setQrSvg] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [disablePassword, setDisablePassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const enabled = !!user?.totp_enabled;

  const startSetup = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/2fa/setup");
      setQrSvg(data.qr_svg);
      setSecret(data.secret);
      setStage("setting-up");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmSetup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/2fa/verify", { code: code.trim() });
      setBackupCodes(data.backup_codes);
      setUser({ ...user, totp_enabled: true });
      setStage("backup-codes");
      setCode("");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const finishSetup = () => {
    setStage("idle");
    setQrSvg("");
    setSecret("");
    setBackupCodes([]);
    toast.success("Two-factor authentication enabled.");
  };

  const confirmDisable = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/2fa/disable", { password: disablePassword });
      setUser({ ...user, totp_enabled: false });
      setDisablePassword("");
      setStage("idle");
      toast.success("Two-factor authentication disabled.");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard?.writeText(backupCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="border-2 border-ink-800 bg-black p-6 sm:p-8" data-testid="two-factor-card">
      <div className="flex items-center gap-3 mb-6">
        <Smartphone className="text-brand-pink" size={22} />
        <h2 className="font-display uppercase text-3xl leading-none">Two-Factor Authentication</h2>
      </div>

      {stage === "idle" && (
        <div className="max-w-md">
          {enabled ? (
            <>
              <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-brand-cyan border border-brand-cyan/50 px-3 py-1.5 mb-5">
                <ShieldCheck size={13} /> Enabled
              </p>
              <p className="font-mono text-sm text-zinc-400 mb-5">
                Your account requires a 6-digit code from an authenticator app at sign-in.
              </p>
              <button
                data-testid="disable-2fa-start"
                onClick={() => setStage("disabling")}
                className="inline-flex items-center justify-center gap-2 font-anton uppercase tracking-widest px-6 py-3 border-2 border-brand-pink text-brand-pink hover:bg-brand-pink hover:text-black transition-colors"
              >
                Disable 2FA
              </button>
            </>
          ) : (
            <>
              <p className="font-mono text-sm text-zinc-400 mb-5">
                Add an extra layer of security — after your password, you'll also need a 6-digit
                code from an app like Google Authenticator or 1Password.
              </p>
              <button data-testid="enable-2fa-start" onClick={startSetup} disabled={loading} className={btn}>
                {loading ? "Starting…" : "Enable Two-Factor Authentication"}
              </button>
            </>
          )}
        </div>
      )}

      {stage === "setting-up" && (
        <div className="max-w-md" data-testid="two-factor-setup">
          <p className="font-mono text-sm text-zinc-400 mb-4">
            1. Scan this QR code with your authenticator app.
          </p>
          <div
            className="bg-white p-4 w-fit mb-4"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <p className="font-mono text-[11px] text-zinc-500 mb-1">Can't scan? Enter this key manually:</p>
          <p data-testid="two-factor-secret" className="font-mono text-sm text-brand-yellow break-all mb-6">{secret}</p>

          <form onSubmit={confirmSetup} className="space-y-4">
            <div>
              <label htmlFor="setup-code" className={labelCls}>2. Enter the 6-digit code from the app</label>
              <input
                id="setup-code"
                data-testid="two-factor-code"
                inputMode="numeric"
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`${field} text-center text-2xl tracking-[0.4em] max-w-[220px]`}
                placeholder="000000"
                maxLength={6}
              />
            </div>
            {error && <p className="text-brand-pink font-mono text-sm">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" data-testid="confirm-2fa-setup" disabled={loading} className={btn}>
                {loading ? "Confirming…" : "Confirm & Enable"}
              </button>
              <button
                type="button"
                onClick={() => { setStage("idle"); setError(""); setCode(""); }}
                className="font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-brand-cyan transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {stage === "backup-codes" && (
        <div className="max-w-md" data-testid="backup-codes">
          <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-brand-cyan border border-brand-cyan/50 px-3 py-1.5 mb-5">
            <ShieldCheck size={13} /> 2FA Enabled
          </p>
          <p className="font-mono text-sm text-zinc-300 mb-4">
            Save these backup codes somewhere safe. Each one can be used once to sign in if you lose
            access to your authenticator app. They won't be shown again.
          </p>
          <div className="grid grid-cols-2 gap-2 border-2 border-ink-800 bg-ink-900 p-5 mb-4 font-mono text-sm text-white">
            {backupCodes.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={copyBackupCodes}
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-300 border-2 border-ink-800 px-4 py-2.5 hover:border-brand-cyan hover:text-brand-cyan transition-colors"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy Codes"}
            </button>
            <button data-testid="finish-2fa-setup" onClick={finishSetup} className={btn}>
              I've Saved These — Done
            </button>
          </div>
        </div>
      )}

      {stage === "disabling" && (
        <form onSubmit={confirmDisable} className="max-w-md space-y-4" data-testid="disable-2fa-form">
          <div>
            <label htmlFor="disable-password" className={labelCls}>Confirm your password to disable 2FA</label>
            <input
              id="disable-password"
              data-testid="disable-2fa-password"
              type="password"
              autoComplete="current-password"
              required
              autoFocus
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              className={field}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-brand-pink font-mono text-sm">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              data-testid="confirm-disable-2fa"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 font-anton uppercase tracking-widest px-6 py-3 bg-brand-pink text-black hover:bg-brand-yellow transition-colors shadow-[4px_4px_0px_#10aeb4] disabled:opacity-50"
            >
              {loading ? "Disabling…" : "Disable 2FA"}
            </button>
            <button
              type="button"
              onClick={() => { setStage("idle"); setError(""); setDisablePassword(""); }}
              className="font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-brand-cyan transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

const emptyInvite = { name: "", email: "" };

function AdminUsers() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyInvite);
  const [adding, setAdding] = useState(false);
  const [resendingId, setResendingId] = useState(null);

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
    setAdding(true);
    try {
      await api.post("/admin/users", form);
      toast.success(`Invite sent to ${form.email}`);
      setForm(emptyInvite);
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

  const resend = async (a) => {
    setResendingId(a.id);
    try {
      await api.post(`/admin/users/${a.id}/resend-invite`);
      toast.success(`Invite resent to ${a.email}`);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setResendingId(null);
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
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => {
                const isSelf = a.email?.toLowerCase() === currentEmail;
                const pending = a.status === "pending";
                return (
                  <tr key={a.id} data-testid={`admin-row-${a.id}`} className="border-t border-ink-800 align-middle">
                    <td className="p-4 font-bold text-white">
                      {a.name}
                      {isSelf && <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-brand-yellow">You</span>}
                    </td>
                    <td className="p-4 text-sm text-zinc-400 break-all">{a.email}</td>
                    <td className="p-4">
                      {pending ? (
                        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-brand-pink border border-brand-pink/50 px-2 py-1">
                          <Clock size={11} /> Invited
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-brand-cyan border border-brand-cyan/50 px-2 py-1">
                          <ShieldCheck size={11} /> Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {pending && (
                          <button
                            data-testid={`resend-invite-${a.id}`}
                            onClick={() => resend(a)}
                            disabled={resendingId === a.id}
                            title="Resend invite email"
                            className="w-9 h-9 inline-flex items-center justify-center border-2 border-ink-800 hover:border-brand-cyan hover:text-brand-cyan transition-colors disabled:opacity-30"
                          >
                            <Mail size={16} />
                          </button>
                        )}
                        <button
                          data-testid={`remove-admin-${a.id}`}
                          onClick={() => remove(a)}
                          disabled={isSelf}
                          title={isSelf ? "You can't remove your own account" : pending ? "Revoke invite" : "Remove admin"}
                          className="w-9 h-9 inline-flex items-center justify-center border-2 border-ink-800 hover:border-brand-pink hover:text-brand-pink transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-ink-800 disabled:hover:text-current"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
        <h3 className="font-mono uppercase text-xs tracking-widest text-zinc-300">Invite New Admin</h3>
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
          <p className="font-mono text-[11px] text-zinc-500">
            They'll get an email with an Accept Invite button to set their own password and sign in.
          </p>
        </div>
        <div className="sm:col-span-2">
          <button type="submit" data-testid="add-admin-submit" disabled={adding} className={btn}>
            {adding ? "Sending…" : "Send Invite"}
          </button>
        </div>
      </form>
    </section>
  );
}

const ACTION_LABELS = {
  "registration.update": "Registration Updated",
  "registration.delete": "Registration Deleted",
  "admin.invite": "Admin Invited",
  "admin.resend_invite": "Invite Resent",
  "admin.remove": "Admin Removed",
  "admin.password_change": "Password Changed",
  "admin.password_reset": "Password Reset",
  "admin.2fa_enabled": "2FA Enabled",
  "admin.2fa_disabled": "2FA Disabled",
};

function fmtTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? iso : d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function AuditLog() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/audit-log")
      .then(({ data }) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="border-2 border-ink-800 bg-black p-6 sm:p-8" data-testid="audit-log-card">
      <div className="flex items-center gap-3 mb-6">
        <ScrollText className="text-brand-yellow" size={22} />
        <h2 className="font-display uppercase text-3xl leading-none">Audit Log</h2>
      </div>

      {loading ? (
        <p className="font-mono uppercase tracking-widest text-brand-yellow animate-pulse">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="font-mono text-sm text-zinc-500">No admin actions recorded yet.</p>
      ) : (
        <div className="border-2 border-ink-800 overflow-x-auto max-h-[480px] overflow-y-auto" data-testid="audit-log-table">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0">
              <tr className="bg-ink-900 font-mono uppercase text-[10px] tracking-[0.2em] text-zinc-500">
                <th className="p-4">When</th>
                <th className="p-4">Admin</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target</th>
                <th className="p-4">Detail</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-t border-ink-800 align-top">
                  <td className="p-4 text-xs text-zinc-500 whitespace-nowrap font-mono">{fmtTime(e.created_at)}</td>
                  <td className="p-4 text-sm text-zinc-300 break-all">{e.actor_email || "—"}</td>
                  <td className="p-4 text-sm text-brand-cyan whitespace-nowrap">{ACTION_LABELS[e.action] || e.action}</td>
                  <td className="p-4 text-sm text-zinc-400 break-all">{e.target || "—"}</td>
                  <td className="p-4 text-xs text-zinc-500 break-all">{e.detail || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
          <TwoFactorAuth />
          <AdminUsers />
          <AuditLog />
        </div>
      </main>
    </div>
  );
}
