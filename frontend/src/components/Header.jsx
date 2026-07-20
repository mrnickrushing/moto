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
      className={`fixed top-0 left-0 w-full z-50 border-b-2 transition-colors duration-300 ${
        scrolled ? "bg-black/85 backdrop-blur-xl border-ink-800" : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-3 group">
          <span className="font-display text-2xl sm:text-3xl uppercase leading-none">
            <span className="text-brand-yellow">MOTO</span>
            <span className="text-brand-pink">MAYHEM</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-9">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              data-testid={`nav-${n.label.toLowerCase()}`}
              className={({ isActive }) =>
                `font-mono text-xs uppercase tracking-[0.2em] transition-colors hover:text-brand-yellow ${
                  isActive ? "text-brand-yellow" : "text-zinc-300"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
          <Link
            to="/register"
            data-testid="nav-register-cta"
            className="font-anton uppercase tracking-widest text-sm px-6 py-3 bg-brand-yellow text-black border-2 border-transparent hover:bg-black hover:text-brand-yellow hover:border-brand-yellow transition-colors duration-200 shadow-[4px_4px_0px_#ec4899] hover:shadow-[6px_6px_0px_#ec4899]"
          >
            Register
          </Link>
        </nav>

        <button
          data-testid="mobile-menu-toggle"
          className="lg:hidden text-white p-2"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div data-testid="mobile-menu" className="lg:hidden bg-black border-t-2 border-ink-800 px-5 py-6 flex flex-col gap-5">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className="font-anton uppercase text-2xl tracking-wide text-zinc-200"
            >
              {n.label}
            </NavLink>
          ))}
          <Link
            to="/register"
            className="font-anton uppercase tracking-widest text-lg px-6 py-4 bg-brand-yellow text-black text-center shadow-[4px_4px_0px_#ec4899]"
          >
            Register — ${EVENT.price}
          </Link>
        </div>
      )}
    </header>
  );
}
