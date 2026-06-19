import { X, Camera, Calendar, AlignLeft, Sparkles } from "lucide-react";
import { Artwork } from "../types";

interface DetailOverlayProps {
  artwork: Artwork | null;
  onClose: () => void;
  onAskAI: (artwork: Artwork) => void;
  activeThemeColor: string;
}

export default function DetailOverlay({
  artwork,
  onClose,
  onAskAI,
  activeThemeColor,
}: DetailOverlayProps) {
  if (!artwork) return null;

  return (
    <div
      id="artwork-detail-overlay"
      className="bg-neutral-900/90 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden w-full md:w-96 text-white shadow-2xl transition-all duration-300"
    >
      {/* Cover visual header */}
      <div className="relative h-44 w-full bg-neutral-950 overflow-hidden">
        <img
          src={artwork.url}
          alt={artwork.title}
          className="w-full h-full object-cover opacity-80"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 bg-neutral-900/80 hover:bg-neutral-800 rounded-full border border-white/10 transition"
        >
          <X className="w-4 h-4 text-white" />
        </button>
        <span
          className="absolute bottom-3 left-4 px-2 py-0.5 rounded text-[9px] uppercase tracking-widest font-mono font-bold"
          style={{ backgroundColor: activeThemeColor + "33", color: activeThemeColor, border: `1px solid ${activeThemeColor}44` }}
        >
          {artwork.category}
        </span>
      </div>

      {/* Narrative & Specifications info */}
      <div className="p-5 space-y-4">
        <div>
          <h2 className="font-sans font-semibold text-lg text-white tracking-tight">
            {artwork.title}
          </h2>
          <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
            <span>By {artwork.artist}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {artwork.year}
            </span>
          </div>
        </div>

        {/* Story description */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-neutral-400 font-mono">
            <AlignLeft className="w-3.5 h-3.5" />
            <span>Curatorial Statement</span>
          </div>
          <p className="font-sans text-xs text-neutral-300 leading-relaxed max-h-32 overflow-y-auto pr-1">
            {artwork.description}
          </p>
        </div>

        {/* Technical specs block */}
        {artwork.cameraSpecs && (
          <div className="border-t border-white/10 pt-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-neutral-400 font-mono">
              <Camera className="w-3.5 h-3.5" />
              <span>Optics & Capture Specs</span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
              <div className="bg-white/5 border border-white/5 p-2 rounded">
                <span className="text-neutral-500 block uppercase text-[8px]">SHUTTER</span>
                <span className="text-neutral-200 font-semibold">{artwork.cameraSpecs.shutter}</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-2 rounded">
                <span className="text-neutral-500 block uppercase text-[8px]">ISO_SPEED</span>
                <span className="text-neutral-200 font-semibold">{artwork.cameraSpecs.iso}</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-2 rounded">
                <span className="text-neutral-500 block uppercase text-[8px]">APERTURE</span>
                <span className="text-neutral-200 font-semibold">{artwork.cameraSpecs.aperture}</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-2 rounded">
                <span className="text-neutral-500 block uppercase text-[8px]">LENS_PROFILE</span>
                <span className="text-neutral-200 font-semibold max-w-full truncate block" title={artwork.cameraSpecs.lens}>
                  {artwork.cameraSpecs.lens}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Co-pilot trigger button */}
        <button
          onClick={() => onAskAI(artwork)}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-sans text-xs font-medium text-black bg-white hover:bg-neutral-200 transition font-sans"
          style={{
            backgroundColor: activeThemeColor,
            color: "#000",
          }}
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Ask AI Curator Co-pilot</span>
        </button>
      </div>
    </div>
  );
}
