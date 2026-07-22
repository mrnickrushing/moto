import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Eye, TrendingUp } from "lucide-react";
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

// In its own chunk (lazy-loaded from AdminDashboard) so recharts never ships
// to public site visitors — it's only fetched when an admin opens this tab.
export default function AdminAnalyticsTab() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/analytics/summary", { params: { days: 30 } })
      .then(({ data }) => setSummary(data))
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="font-mono uppercase tracking-widest text-brand-yellow animate-pulse">Loading…</p>;
  }
  if (!summary || summary.total_pageviews === 0) {
    return (
      <div className="border-2 border-ink-800 p-16 text-center">
        <p className="font-mono uppercase tracking-widest text-zinc-500">No pageviews recorded yet.</p>
      </div>
    );
  }

  const chartData = summary.daily.map((d) => ({
    day: d.day.slice(5), // MM-DD
    views: d.count,
  }));
  const topPage = summary.top_pages[0];

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px mb-10">
        <Stat icon={Eye} label={`Pageviews (${summary.days}d)`} value={summary.total_pageviews} accent="text-brand-cyan" />
        <Stat icon={TrendingUp} label="Busiest Page" value={topPage ? topPage.path : "—"} accent="text-brand-yellow" />
      </div>

      <div className="border-2 border-ink-800 bg-black p-6 mb-10">
        <p className="font-mono uppercase text-xs tracking-widest text-zinc-500 mb-6">Daily Pageviews</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2d28" vertical={false} />
            <XAxis dataKey="day" stroke="#71717a" fontSize={11} tickLine={false} axisLine={{ stroke: "#2a2d28" }} />
            <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "#111310", border: "2px solid #2a2d28", borderRadius: 0, fontFamily: "monospace", fontSize: 12 }}
              labelStyle={{ color: "#e2d64a" }}
              cursor={{ fill: "rgba(226,214,74,0.06)" }}
            />
            <Bar dataKey="views" fill="#e2d64a" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border-2 border-ink-800 bg-black p-6">
          <p className="font-mono uppercase text-xs tracking-widest text-zinc-500 mb-4">Top Pages</p>
          <div className="space-y-3">
            {summary.top_pages.map((p) => (
              <div key={p.path} className="flex items-center justify-between text-sm">
                <span className="text-zinc-300 font-mono truncate pr-3">{p.path}</span>
                <span className="text-brand-cyan font-mono font-bold tabular-nums shrink-0">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border-2 border-ink-800 bg-black p-6">
          <p className="font-mono uppercase text-xs tracking-widest text-zinc-500 mb-4">Top Referrers</p>
          {summary.top_referrers.length === 0 ? (
            <p className="text-zinc-500 text-sm font-mono">No external referrers yet — most traffic is direct.</p>
          ) : (
            <div className="space-y-3">
              {summary.top_referrers.map((r) => (
                <div key={r.domain} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300 font-mono truncate pr-3">{r.domain}</span>
                  <span className="text-brand-pink font-mono font-bold tabular-nums shrink-0">{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
