import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, MapPin } from "lucide-react";
import { EVENT } from "@/data/rodeo";

export default function Footer() {
  return (
    <footer data-testid="site-footer" className="relative bg-black border-t-2 border-ink-800 pt-20 pb-10 overflow-hidden">
      <div className="checker-band absolute top-0 left-0 w-full h-3 opacity-40" />
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-display text-4xl uppercase leading-none">
              <span className="text-brand-yellow">MOTO</span>{" "}
              <span className="text-brand-pink">MAYHEM</span>{" "}
              <span className="text-brand-cyan">RODEO</span>
            </h3>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500 mt-4">
              {EVENT.tagline}
            </p>
          </div>

          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-cyan">Where & When</p>
            <p className="flex items-start gap-2 text-zinc-300">
              <MapPin size={18} className="text-brand-pink mt-0.5 shrink-0" />
              {EVENT.location}, {EVENT.city}
            </p>
            <p className="font-mono text-zinc-300">{EVENT.date}</p>
            <a href={`mailto:${EVENT.email}`} className="flex items-center gap-2 text-zinc-300 hover:text-brand-yellow transition-colors break-all">
              <Mail size={18} className="text-brand-pink shrink-0" />
              {EVENT.email}
            </a>
          </div>

          <div className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-cyan">Follow The Mayhem</p>
            <div className="flex gap-4">
              <a href="#" aria-label="Instagram" className="w-11 h-11 border-2 border-ink-800 flex items-center justify-center hover:border-brand-yellow hover:text-brand-yellow transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="Facebook" className="w-11 h-11 border-2 border-ink-800 flex items-center justify-center hover:border-brand-yellow hover:text-brand-yellow transition-colors">
                <Facebook size={20} />
              </a>
            </div>
            <Link to="/register" data-testid="footer-register" className="inline-block font-anton uppercase tracking-widest text-sm px-6 py-3 bg-brand-pink text-black hover:bg-brand-yellow transition-colors mt-2">
              Register Now
            </Link>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-ink-800 flex flex-col sm:flex-row justify-between gap-4 text-zinc-600 font-mono text-xs uppercase tracking-widest">
          <span>© 2026 MOTO Mayhem Rodeo</span>
          <div className="flex gap-6">
            <span>Ride Hard · Cause Mayhem · Have Fun</span>
            <Link to="/admin/login" data-testid="admin-link" className="hover:text-brand-cyan transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
