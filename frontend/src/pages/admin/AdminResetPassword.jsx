import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { KeyRound, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api, { formatApiErrorDetail } from "@/lib/api";

const MIN_PW = 14;

const field =
  "w-full bg-black border-2 border-ink-800 px-4 py-3 text-white font-mono focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-pink transition-colors placeholder:text-zinc-600";
const labelCls = "font-mono uppercase text-xs tracking-widest text-zinc-400 block mb-2";

function Shell({ children }) {
  return (
    <div data-testid="admin-reset-password-page" className="min-h-screen flex items-center justify-center bg-black px-5">
      <div className="noise-overlay" />
      <div className="w-full max-w-md border-2 border-ink-800 bg-ink-900 p-10">{children}</div>
    </div>
  );
}

export default function AdminResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState("checking"); // checking | valid | invalid
  const [account, setAccount] = useState(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    api
      .get(`/auth/reset-password/${token}`)
      .then(({ data }) => {
        setAccount(data);
        setStatus("valid");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < MIN_PW) {
      setError(`Password must be at least ${MIN_PW} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Password and confirmation don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(token, password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "checking") {
    return (
      <Shell>
        <p className="font-mono uppercase tracking-[0.3em] text-brand-yellow animate-pulse text-center">
          Checking link…
        </p>
      </Shell>
    );
  }

  if (status === "invalid") {
    return (
      <Shell>
        <AlertTriangle className="text-brand-pink mb-6" size={36} />
        <h1 className="font-display uppercase text-3xl leading-none">Link Expired</h1>
        <p className="font-mono text-sm text-zinc-400 mt-4 leading-relaxed">
          This reset link is invalid or has already been used. Reset links only last 1 hour —
          request a fresh one.
        </p>
        <Link
          to="/admin/forgot-password"
          className="inline-flex items-center justify-center mt-8 font-anton uppercase tracking-widest text-lg px-6 py-4 bg-brand-yellow text-black hover:bg-brand-cyan transition-colors shadow-[5px_5px_0px_#ec4899]"
        >
          Request New Link
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <KeyRound className="text-brand-yellow mb-6" size={36} />
      <h1 className="font-display uppercase text-4xl leading-none">Reset Password</h1>
      <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 mt-2 mb-8 break-all">
        {account?.email}
      </p>

      <form onSubmit={submit} className="space-y-5" data-testid="reset-password-form">
        <div>
          <label htmlFor="reset-password" className={labelCls}>New Password</label>
          <input
            id="reset-password"
            data-testid="reset-password-input"
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PW}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
            placeholder={`At least ${MIN_PW} characters`}
          />
        </div>
        <div>
          <label htmlFor="reset-confirm" className={labelCls}>Confirm Password</label>
          <input
            id="reset-confirm"
            data-testid="reset-confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PW}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={field}
            placeholder="Re-enter password"
          />
        </div>
        {error && <p data-testid="reset-password-error" className="text-brand-pink font-mono text-sm">{error}</p>}
        <button
          data-testid="reset-password-submit"
          disabled={submitting}
          className="w-full font-anton uppercase tracking-widest text-lg px-6 py-4 bg-brand-yellow text-black hover:bg-brand-cyan transition-colors shadow-[5px_5px_0px_#ec4899] disabled:opacity-50"
        >
          {submitting ? "Resetting…" : "Reset Password & Sign In"}
        </button>
      </form>
    </Shell>
  );
}
