import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatApiErrorDetail } from "@/lib/api";

export default function AdminLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/admin", { replace: true });
  }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const field = "w-full bg-black border-2 border-ink-800 px-4 py-3 text-white font-mono focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-pink transition-colors placeholder:text-zinc-600";

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
            <label htmlFor="admin-password" className="font-mono uppercase text-xs tracking-widest text-zinc-400 block mb-2">Password</label>
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
