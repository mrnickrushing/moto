import { useState } from "react";

/**
 * Renders a sponsor's logo image when one is set on the sponsor record,
 * and gracefully falls back to `fallback` when there's no logo OR the
 * image fails to load (e.g. a wrong/missing path). This keeps the live
 * site from ever showing a broken-image icon.
 *
 * Drop logo files in `frontend/public/images/sponsors/` and set the
 * sponsor's `logo` field to e.g. "/images/sponsors/golds-bakery.png".
 */
export default function SponsorLogo({ sponsor, className = "", fallback = null }) {
  const [failed, setFailed] = useState(false);
  if (!sponsor.logo || failed) return fallback;
  return (
    <img
      src={sponsor.logo}
      alt={`${sponsor.name} logo`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
