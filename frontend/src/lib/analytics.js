import { API } from "@/lib/api";

// Minimal, cookie-free pageview tracking — no persistent visitor ID, no
// third-party script. Respects Do Not Track and never tracks /admin routes.
export function trackPageview(path) {
  try {
    if (path.startsWith("/admin")) return;
    if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;

    const payload = JSON.stringify({ path, referrer: document.referrer || "" });
    const url = `${API}/analytics/pageview`;

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(url, blob);
    } else {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Analytics must never break the app.
  }
}
