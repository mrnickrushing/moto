import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle, ArrowRight } from "lucide-react";
import api from "@/lib/api";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState("checking"); // checking | paid | failed

  useEffect(() => {
    if (!sessionId) {
      setStatus("failed");
      return;
    }
    let attempts = 0;
    const poll = async () => {
      try {
        const { data } = await api.get(`/payments/status/${sessionId}`);
        if (data.payment_status === "paid") {
          setStatus("paid");
          return;
        }
        if (["failed", "expired"].includes(data.payment_status)) {
          setStatus("failed");
          return;
        }
      } catch (e) {}
      attempts += 1;
      if (attempts < 8) setTimeout(poll, 2000);
      else setStatus("failed");
    };
    poll();
  }, [sessionId]);

  return (
    <div data-testid="payment-success-page" className="min-h-[80vh] flex items-center bg-black">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-32 pb-20 text-center">
        {status === "checking" && (
          <>
            <Loader2 className="text-brand-cyan animate-spin mx-auto mb-6" size={56} />
            <h1 className="font-display uppercase text-5xl sm:text-6xl leading-none">Confirming Payment…</h1>
            <p className="text-zinc-400 mt-4">Hold tight, we're checking with the payment processor.</p>
          </>
        )}
        {status === "paid" && (
          <>
            <CheckCircle2 className="text-brand-yellow mx-auto mb-6" size={64} />
            <h1 className="font-display uppercase text-6xl sm:text-7xl leading-[0.85]">
              You're <span className="text-brand-pink">In!</span>
            </h1>
            <p className="text-zinc-400 text-lg mt-6">
              Registration confirmed and paid. Get your bike ready — we'll see you in Ione.
              Ride Hard · Cause Mayhem · Have Fun.
            </p>
            <Link to="/" className="inline-flex items-center gap-2 mt-10 font-anton uppercase tracking-widest px-10 py-4 bg-brand-yellow text-black hover:bg-brand-cyan transition-colors shadow-[5px_5px_0px_#ec4899]">
              Back Home <ArrowRight size={20} />
            </Link>
          </>
        )}
        {status === "failed" && (
          <>
            <XCircle className="text-brand-pink mx-auto mb-6" size={64} />
            <h1 className="font-display uppercase text-5xl sm:text-6xl leading-none">Payment Not Confirmed</h1>
            <p className="text-zinc-400 text-lg mt-6">
              We couldn't confirm your payment. If you were charged, contact us and we'll sort it out.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 mt-10 font-anton uppercase tracking-widest px-10 py-4 border-2 border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-black transition-colors">
              Try Again <ArrowRight size={20} />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
