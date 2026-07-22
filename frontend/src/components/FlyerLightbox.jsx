import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function FlyerLightbox({
  flyers,
  index,
  onClose,
  onChange,
  altPrefix = "MOTO Mayhem event flyer",
  ariaLabel = "Event flyer viewer",
}) {
  const open = index !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onChange((index + 1) % flyers.length);
      if (e.key === "ArrowLeft") onChange((index - 1 + flyers.length) % flyers.length);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, index, flyers.length, onClose, onChange]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 sm:p-10"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-5 right-5 sm:top-8 sm:right-8 w-11 h-11 flex items-center justify-center border-2 border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-black transition-colors clip-corner"
      >
        <X size={22} />
      </button>

      <img
        src={flyers[index]}
        alt={`${altPrefix} ${index + 1}`}
        role="presentation"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[82vh] max-w-[92vw] object-contain border-4 border-brand-pink poster-shadow-cyan"
      />

      {flyers.length > 1 && (
        <div
          role="presentation"
          className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-5 sm:gap-7"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onChange((index - 1 + flyers.length) % flyers.length)}
            aria-label="Previous flyer"
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-brand-cyan text-brand-cyan hover:bg-brand-cyan hover:text-black transition-colors clip-corner"
          >
            <ChevronLeft size={22} />
          </button>
          <span className="font-condensed font-extrabold uppercase tracking-[0.16em] text-zinc-300 text-xs sm:text-sm">
            {index + 1} / {flyers.length}
          </span>
          <button
            onClick={() => onChange((index + 1) % flyers.length)}
            aria-label="Next flyer"
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-brand-cyan text-brand-cyan hover:bg-brand-cyan hover:text-black transition-colors clip-corner"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}
