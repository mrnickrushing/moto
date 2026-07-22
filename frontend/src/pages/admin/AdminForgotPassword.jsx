import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Mail } from "lucide-react";
import api, { formatApiErrorDetail } from "@/lib/api";

const field =
  "w-full bg-black border-2 border-ink-800 px-4 py-3 text-white font-mono focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-pink transition-colors placeholder:text-zinc-600";

export default function AdminForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      // Always show the same success state, whether or not the account
      // exists — this endpoint intentionally never reveals that.
      setSent(true);
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="admin-forgot-password-page" className="min-h-screen flex items-center justify-center bg-black px-5">
      <div className="noise-overlay" />
      <div className="w-full max-w-md border-2 border-ink-800 bg-ink-900 p-10">
        {sent ? (
          <>
            <Mail className="text-brand-cyan mb-6" size={36} />
            <h1 className="font-display uppercase text-3xl leading-none">Check Your Email</h1>
            <p className="font-mono text-sm text-zinc-400 mt-4 leading-relaxed">
              If <span className="text-zinc-200">{email}</span> has an admin account, a password reset
              link is on its way. It's valid for 1 hour.
            </p>
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center mt-8 font-anton uppercase tracking-widest text-lg px-6 py-4 bg-brand-yellow text-black hover:bg-brand-cyan transition-colors shadow-[5px_5px_0px_#ec4899]"
            >
              Back to Sign In
            </Link>
          </>
        ) : (
          <>
            <KeyRound className="text-brand-yellow mb-6" size={36} />
            <h1 className="font-display uppercase text-4xl leading-none">Forgot Password</h1>
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 mt-2 mb-8">
              We'll email you a reset link
            </p>

            <form onSubmit={submit} className="space-y-5" data-testid="forgot-password-form">
              <div>
                <label htmlFor="forgot-email" className="font-mono uppercase text-xs tracking-widest text-zinc-400 block mb-2">Email</label>
                <input
                  id="forgot-email"
                  data-testid="forgot-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={field}
                  placeholder="admin@motomayhem.com"
                />
              </div>
              {error && <p data-testid="forgot-password-error" className="text-brand-pink font-mono text-sm">{error}</p>}
              <button
                data-testid="forgot-password-submit"
                disabled={loading}
                className="w-full font-anton uppercase tracking-widest text-lg px-6 py-4 bg-brand-yellow text-black hover:bg-brand-cyan transition-colors shadow-[5px_5px_0px_#ec4899] disabled:opacity-50"
              >
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
              <Link
                to="/admin/login"
                className="block text-center font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-brand-cyan transition-colors"
              >
                Back to Sign In
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
