import { Link } from "react-router-dom";
import { Reveal } from "@/components/motion";

export default function NotFound() {
  return (
    <div data-testid="notfound-page" className="min-h-[70vh] flex items-center bg-black">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-32">
        <Reveal>
          <p className="font-mono uppercase tracking-[0.3em] text-brand-cyan text-xs mb-4">/ Wiped Out</p>
          <h1 className="font-display uppercase text-[28vw] sm:text-[16rem] leading-[0.8] text-outline-pink">404</h1>
          <p className="text-zinc-400 text-lg mt-6">This line doesn't exist. Get back on the course.</p>
          <Link to="/" className="inline-block mt-8 font-anton uppercase tracking-widest px-8 py-4 bg-brand-yellow text-black hover:bg-brand-cyan transition-colors shadow-[5px_5px_0px_#ec4899]">
            Back Home
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
