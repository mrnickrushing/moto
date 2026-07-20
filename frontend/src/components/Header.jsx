import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { EVENT } from "@/data/rodeo";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/event", label: "Event" },
  { to: "/classes", label: "Classes" },
  { to: "/sponsors", label: "Sponsors" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
        scrolled ? "bg-ink-950/95 backdrop-blur-md" : "bg-ink-950/70"
      }`}
    >
      <div className="h-7 overflow-hidden bg-brand-yellow text-black border-b-2 border-black font-condensed font-extrabold uppercase tracking-[0.14em] text-[11px] sm:text-xs">
        <div className="ticker-track flex h-full items-center whitespace-nowrap" aria-hidden="true">
          {[0, 1].map((copy) => (
            <span key={copy} className="flex items-center">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="flex items-center">
                  <span className="px-4">Pre-registration closes {EVENT.regDeadline}</span>
                  <span>◆</span>
                  <span className="px-4">Ione, California</span>
                  <span>◆</span>
                  <span className="px-4">Check-in 9 AM</span>
                  <span>◆</span>
                  <span className="px-4">Ride at Noon</span>
                  <span className="px-4 text-brand-pink">⚡</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="border-b-2 border-brand-pink/80">
        <div className="max-w-[1500px] mx-auto px-5 sm:px-8 h-[76px] flex items-center justify-between">
        <Link to="/" data-testid="logo-link" className="group -rotate-1 hover:rotate-0 transition-transform">
          <span className="font-display italic text-2xl sm:text-[2rem] uppercase leading-none hero-title">
            <span className="text-brand-yellow">MOTO</span>{" "}
            <span className="text-white">MAYHEM</span>{" "}
            <span className="text-brand-cyan hidden sm:inline">RODEO</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 border border-zinc-600/80 px-2 py-1 clip-corner bg-black/45">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              data-testid={`nav-${n.label.toLowerCase()}`}
              className={({ isActive }) =>
                `font-condensed font-bold text-sm uppercase tracking-[0.14em] px-4 py-2 transition-colors hover:text-brand-yellow ${
                  isActive ? "text-brand-cyan" : "text-zinc-100"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
          <Link
            to="/register"
            data-testid="nav-register-cta"
            className="ml-6 font-anton uppercase tracking-widest text-base px-7 py-3.5 bg-brand-yellow text-black border-2 border-brand-yellow hover:bg-black hover:text-brand-yellow transition-colors duration-200 poster-shadow-pink clip-corner"
          >
            Register Now
          </Link>
        </nav>

        <button
          data-testid="mobile-menu-toggle"
          className="lg:hidden text-white p-2 border-2 border-zinc-700 hover:border-brand-cyan transition-colors"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
        </div>
      </div>

      {open && (
        <div data-testid="mobile-menu" className="lg:hidden bg-ink-950 border-b-4 border-brand-cyan px-5 py-7 flex flex-col gap-5 poster-grid">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className="font-anton uppercase text-3xl tracking-wide text-zinc-100 hover:text-brand-yellow"
            >
              {n.label}
            </NavLink>
          ))}
          <Link
            to="/register"
            className="font-anton uppercase tracking-widest text-xl px-6 py-4 bg-brand-yellow text-black text-center poster-shadow-pink clip-corner"
          >
            Register — ${EVENT.price}
          </Link>
        </div>
      )}
    </header>
  );
}
