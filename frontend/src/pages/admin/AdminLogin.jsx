import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatApiErrorDetail } from "@/lib/api";

const field = "w-full bg-black border-2 border-ink-800 px-4 py-3 text-white font-mono focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-pink transition-colors placeholder:text-zinc-600";

export default function AdminLogin() {
  const { user, login, verifyLogin2FA } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaToken, setMfaToken] = useState(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (user) navigate("/admin", { replace: true });
  }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.mfa_required) {
        setMfaToken(result.mfa_token);
      } else {
        navigate("/admin", { replace: true });
      }
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyLogin2FA(mfaToken, code.trim());
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (mfaToken) {
    return (
      <div data-testid="admin-login-page" className="min-h-screen flex items-center justify-center bg-black px-5">
        <div className="noise-overlay" />
        <div className="w-full max-w-md border-2 border-ink-800 bg-ink-900 p-10">
          <ShieldCheck className="text-brand-cyan mb-6" size={36} />
          <h1 className="font-display uppercase text-4xl leading-none">Verify It's You</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 mt-2 mb-8">
            Enter the 6-digit code from your authenticator app
          </p>
          <form onSubmit={submitCode} className="space-y-5" data-testid="admin-2fa-form">
            <div>
              <label htmlFor="mfa-code" className="font-mono uppercase text-xs tracking-widest text-zinc-400 block mb-2">Authentication Code</label>
              <input
                id="mfa-code"
                data-testid="mfa-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`${field} text-center text-2xl tracking-[0.4em]`}
                placeholder="000000"
                maxLength={20}
              />
              <p className="font-mono text-[11px] text-zinc-500 mt-2">
                Lost your device? You can use one of your backup codes instead.
              </p>
            </div>
            {error && <p data-testid="admin-2fa-error" className="text-brand-pink font-mono text-sm">{error}</p>}
            <button
              data-testid="admin-2fa-submit"
              disabled={loading}
              className="w-full font-anton uppercase tracking-widest text-lg px-6 py-4 bg-brand-yellow text-black hover:bg-brand-cyan transition-colors shadow-[5px_5px_0px_#ec4899] disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify & Sign In"}
            </button>
            <button
              type="button"
              onClick={() => { setMfaToken(null); setCode(""); setError(""); }}
              className="block w-full text-center font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-brand-cyan transition-colors"
            >
              Back to Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="admin-login-page" className="min-h-screen flex items-center justify-center bg-black px-5">
      <div className="noise-overlay" />
      <div className="w-full max-w-md border-2 border-ink-800 bg-ink-900 p-10">
        <Lock className="text-brand-yellow mb-6" size={36} />
        <h1 className="font-display uppercase text-4xl leading-none">Admin Access</h1>
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 mt-2 mb-8">Moto Mayhem Control</p>

        <form onSubmit={submit} className="space-y-5" data-testid="admin-login-form">
          <div>
            <label htmlFor="admin-email" className="font-mono uppercase text-xs tracking-widest text-zinc-400 block mb-2">Email</label>
            <input id="admin-email" data-testid="admin-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} placeholder="admin@motomayhem.com" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="admin-password" className="font-mono uppercase text-xs tracking-widest text-zinc-400">Password</label>
              <Link to="/admin/forgot-password" data-testid="forgot-password-link" className="font-mono text-[11px] uppercase tracking-widest text-brand-cyan hover:text-brand-yellow transition-colors">
                Forgot?
              </Link>
            </div>
            <input id="admin-password" data-testid="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={field} placeholder="••••••••" />
          </div>
          {error && <p data-testid="admin-login-error" className="text-brand-pink font-mono text-sm">{error}</p>}
          <button
            data-testid="admin-login-submit"
            disabled={loading}
            className="w-full font-anton uppercase tracking-widest text-lg px-6 py-4 bg-brand-yellow text-black hover:bg-brand-cyan transition-colors shadow-[5px_5px_0px_#ec4899] disabled:opacity-50"
          >
            {loading ? "Signing In…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
