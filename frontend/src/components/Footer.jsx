import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, MapPin } from "lucide-react";
import { EVENT } from "@/data/rodeo";

export default function Footer() {
  return (
    <footer data-testid="site-footer" className="relative bg-ink-950 border-t-4 border-brand-cyan pt-24 pb-10 overflow-hidden poster-grid">
      <div className="race-stripes absolute top-0 left-0 w-full h-3" />
      <div className="max-w-[1500px] mx-auto px-5 sm:px-8">
        <div className="grid md:grid-cols-[1.2fr_0.8fr_0.8fr] gap-12 lg:gap-20">
          <div>
            <h3 className="font-display text-5xl sm:text-7xl uppercase leading-[0.82] hero-title -rotate-1">
              <span className="text-brand-yellow block">MOTO</span>
              <span className="text-white block ml-6">MAYHEM</span>
              <span className="text-brand-pink block">RODEO</span>
            </h3>
            <p className="font-brush text-2xl text-brand-cyan mt-6 -rotate-2">
              {EVENT.tagline}
            </p>
          </div>

          <div className="space-y-3">
            <p className="font-condensed font-extrabold text-sm uppercase tracking-[0.2em] text-brand-cyan border-b-2 border-ink-800 pb-3">Where &amp; When</p>
            <p className="flex items-start gap-2 text-zinc-300">
              <MapPin size={18} className="text-brand-pink mt-0.5 shrink-0" />
              {EVENT.location}, {EVENT.city}
            </p>
            <p className="font-condensed font-bold uppercase tracking-wider text-xl text-brand-yellow">{EVENT.date}</p>
            <a href={`mailto:${EVENT.email}`} className="flex items-center gap-2 text-zinc-300 hover:text-brand-yellow transition-colors break-all">
              <Mail size={18} className="text-brand-pink shrink-0" />
              {EVENT.email}
            </a>
          </div>

          <div className="space-y-4">
            <p className="font-condensed font-extrabold text-sm uppercase tracking-[0.2em] text-brand-cyan border-b-2 border-ink-800 pb-3">Follow The Mayhem</p>
            <div className="flex gap-4">
              <a href="#" aria-label="Instagram" className="w-12 h-12 border-2 border-ink-800 flex items-center justify-center hover:border-brand-yellow hover:text-brand-yellow transition-colors clip-corner">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="Facebook" className="w-12 h-12 border-2 border-ink-800 flex items-center justify-center hover:border-brand-yellow hover:text-brand-yellow transition-colors clip-corner">
                <Facebook size={20} />
              </a>
            </div>
            <Link to="/register" data-testid="footer-register" className="inline-block font-anton uppercase tracking-widest text-lg px-7 py-4 bg-brand-yellow text-black border-2 border-brand-yellow hover:bg-black hover:text-brand-yellow transition-colors mt-3 poster-shadow-pink clip-corner">
              Register to Ride
            </Link>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t-2 border-ink-800 flex flex-col sm:flex-row justify-between gap-4 text-zinc-500 font-condensed font-bold text-xs uppercase tracking-[0.16em]">
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
