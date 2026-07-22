import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Reveal } from "@/components/motion";
import Kicker from "@/components/Kicker";

export default function HypeReel() {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  return (
    <section className="py-24 bg-black border-b-2 border-ink-800 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 grid lg:grid-cols-[1fr_auto] gap-12 items-center">
        <Reveal>
          <Kicker color="cyan">Straight From The Arena</Kicker>
          <h2 className="font-display uppercase text-5xl sm:text-7xl leading-[0.9]">
            Get <span className="text-brand-cyan">Hyped</span>
          </h2>
          <p className="text-zinc-400 text-lg mt-6 max-w-md">
            Fifteen seconds of what's coming to Ed Hughes Memorial Arena. Ride Hard. Cause Mayhem.
            Have Fun.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative w-[240px] sm:w-[280px] mx-auto -rotate-2 border-4 border-brand-pink poster-shadow-cyan bg-black">
            <video
              ref={videoRef}
              className="w-full aspect-[9/16] object-cover"
              src="/videos/hype-reel.mp4"
              poster="/videos/hype-reel-poster.jpg"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            />
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute video" : "Mute video"}
              data-testid="hype-reel-mute-toggle"
              className="absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center bg-black/70 border-2 border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-black transition-colors"
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
