import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Printer, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { EVENT } from "@/data/rodeo";

const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

function Field({ label, value, className = "" }) {
  return (
    <div className={className}>
      <p className="text-[10px] uppercase tracking-widest text-neutral-500">{label}</p>
      <p className="text-[15px] font-semibold text-black min-h-[20px]">{value || "—"}</p>
    </div>
  );
}

function RegistrationForm({ r }) {
  return (
    <div className="border-2 border-black p-6 mb-6 break-inside-avoid">
      <div className="flex items-baseline justify-between border-b-2 border-black pb-3 mb-4">
        <h2 className="text-2xl font-extrabold uppercase text-black">{r.rider_name}</h2>
        <span className="text-sm font-bold uppercase text-black">
          {r.payment_status === "paid" ? "PAID" : "UNPAID"}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <Field label="Date of Birth" value={r.date_of_birth} />
        <Field label="Age" value={r.age} />
        <Field label="T-Shirt" value={r.tshirt_size} />
        <Field label="Parent / Guardian" value={r.parent_guardian} />
        <Field label="Email" value={r.email} className="col-span-2" />
        <Field label="Phone" value={r.phone} className="col-span-2" />
        <Field
          label="Emergency Contact"
          value={`${r.emergency_name || ""}${r.emergency_relationship ? ` (${r.emergency_relationship})` : ""} ${r.emergency_phone || ""}`.trim()}
          className="col-span-3"
        />
        <Field label="Payment" value={r.payment_method === "stripe" ? "Card (online)" : "Venmo / Cash"} />
      </div>
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
          Classes ({r.entries}) — Total ${r.total}
        </p>
        <ul className="list-disc ml-5 text-[15px] text-black">
          {(r.classes || []).map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>
      <div className="flex items-center gap-8 border-t-2 border-dashed border-neutral-400 pt-3 text-sm text-black">
        <span>☐ Checked in</span>
        <span>☐ Paid — Amount $______</span>
        <span className="flex-1">Signature: ______________________</span>
      </div>
    </div>
  );
}

function SponsorForm({ s }) {
  return (
    <div className="border-2 border-black p-6 mb-6 break-inside-avoid">
      <div className="flex items-baseline justify-between border-b-2 border-black pb-3 mb-4">
        <h2 className="text-2xl font-extrabold uppercase text-black">{s.business_name}</h2>
        <span className="text-sm font-bold uppercase text-black">{s.tier}</span>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Field label="Contact" value={s.contact_name} />
        <Field label="Email" value={s.email} />
        <Field label="Phone" value={s.phone} />
        <Field label="Submitted" value={fmtDate(s.created_at)} />
      </div>
      {s.message ? (
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Message</p>
          <p className="text-[15px] text-black whitespace-pre-wrap">{s.message}</p>
        </div>
      ) : null}
      <div className="flex items-center gap-8 border-t-2 border-dashed border-neutral-400 pt-3 text-sm text-black">
        <span>☐ Confirmed</span>
        <span>☐ Payment received</span>
        <span className="flex-1">Notes: ______________________</span>
      </div>
    </div>
  );
}

export default function AdminPrint() {
  const { type } = useParams();
  const isSponsors = type === "sponsors";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const path = isSponsors ? "/admin/sponsor-inquiries" : "/admin/registrations";
      const { data } = await api.get(path);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [isSponsors]);

  useEffect(() => {
    load();
  }, [load]);

  const title = isSponsors ? "Sponsor Inquiries" : "Rider Registrations";

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Toolbar (hidden when printing) */}
      <div className="print:hidden sticky top-0 bg-neutral-100 border-b border-neutral-300 px-6 py-3 flex items-center justify-between">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-black">
          <ArrowLeft size={16} /> Back to Admin
        </Link>
        <button
          onClick={() => window.print()}
          data-testid="do-print"
          className="inline-flex items-center gap-2 bg-black text-white text-sm font-bold uppercase tracking-wide px-5 py-2"
        >
          <Printer size={16} /> Print
        </button>
      </div>

      <div className="max-w-[850px] mx-auto p-8" data-testid="print-view">
        <div className="border-b-4 border-black pb-4 mb-6">
          <h1 className="text-3xl font-extrabold uppercase">{EVENT.name} — {title}</h1>
          <p className="text-sm text-neutral-600 mt-1">
            {EVENT.date} · {EVENT.location}, {EVENT.city} · {items.length} {isSponsors ? "inquiries" : "riders"} · Printed {fmtDate(new Date().toISOString())}
          </p>
        </div>

        {loading ? (
          <p className="text-neutral-500">Loading…</p>
        ) : error ? (
          <p className="text-red-600">Failed to load. Make sure you're logged in as admin.</p>
        ) : items.length === 0 ? (
          <p className="text-neutral-500">Nothing to print yet.</p>
        ) : isSponsors ? (
          items.map((s) => <SponsorForm key={s.id} s={s} />)
        ) : (
          items.map((r) => <RegistrationForm key={r.id} r={r} />)
        )}
      </div>
    </div>
  );
}
