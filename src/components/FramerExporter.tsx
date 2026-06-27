import React, { useState } from "react";
import { Copy, Check, Terminal, ExternalLink, HelpCircle, Layers, Image as ImageIcon, Database, Info, Code } from "lucide-react";
import { Artwork } from "../types";
import { GET_FRAMER_COMPONENT_CODE } from "../utils/framerTemplate";

interface FramerExporterProps {
  artworks: Artwork[];
  onUpdateArtwork: (index: number, updatedFields: Partial<Artwork>) => void;
  activeThemeColor: string;
}

export default function FramerExporter({
  artworks,
  onUpdateArtwork,
  activeThemeColor,
}: FramerExporterProps) {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  // Retrieve the generated Framer-ready single-file code component
  const framerCodeComponent = GET_FRAMER_COMPONENT_CODE(activeThemeColor);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(framerCodeComponent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      alert("Please copy manually from the code view below.");
    }
  };

  return (
    <div
      id="framer-exporter-panel"
      className="bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-white/10 p-5 w-full text-white shadow-2xl transition-all duration-300 space-y-4"
    >
      {/* Header Info */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
          <Database className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h3 className="font-sans font-semibold tracking-wider uppercase text-xs">
            Framer CMS Connector
          </h3>
          <p className="text-[9px] text-neutral-400 font-mono">EXPORT TO DYNAMIC CANVAS</p>
        </div>
      </div>

      {/* Primary Export CTA trigger */}
      <div className="space-y-3.5">
        <p className="text-[11px] text-neutral-300 leading-relaxed">
          Export this fully responsive dynamic 3D cylinder spiral gallery as a <strong>Framer Code Component</strong> with native <strong>CMS property mapping controls</strong>.
        </p>

        <div className="flex gap-2">
          <button
            onClick={handleCopyCode}
            className="flex-1 py-2.5 px-3 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/10 active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied Code!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Framer Code</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowCode(!showCode)}
            className="p-2.5 bg-neutral-800 hover:bg-neutral-700 border border-white/10 rounded-xl text-xs transition text-neutral-300 flex items-center gap-1"
            title="Inspect full source code"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Code expansion drawer */}
      {showCode && (
        <div className="relative rounded-xl border border-white/10 max-h-48 overflow-y-auto bg-black p-3 font-mono text-[9px] text-neutral-400 scrollbar-thin">
          <button
            onClick={handleCopyCode}
            className="absolute top-2 right-2 p-1.5 bg-neutral-900 border border-white/15 rounded-md hover:text-white transition"
          >
            {copied ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
          </button>
          <pre>{framerCodeComponent}</pre>
        </div>
      )}

      {/* Live Framer CMS Playground Sandbox */}
      <div className="border-t border-white/10 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider font-mono text-cyan-400 flex items-center gap-1">
            <Layers className="w-3 h-3" /> Live CMS Inputs Sandbox
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/5 font-mono text-neutral-400 animate-pulse">
            LIVE BINDING
          </span>
        </div>

        <p className="text-[10px] text-neutral-400 leading-normal mb-1">
          Simulate how editing Framer CMS item variables immediately alters your 3D cylinder spiral. Change headers or image references below to watch the WebGL geometry hot-reload:
        </p>

        {/* Dynamic Mock Spreadsheet mapping */}
        <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
          {artworks.slice(0, 4).map((art, index) => (
            <div
              key={art.id}
              className="p-3 bg-neutral-950/70 rounded-xl border border-white/5 space-y-2 hover:border-cyan-500/20 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-neutral-500 group-hover:text-cyan-400 transition">
                  CMS Item #{index + 1}
                </span>
                <span className="text-[8px] px-1.5 py-0.2 bg-white/5 text-neutral-400 rounded">
                  {art.category}
                </span>
              </div>

              {/* Title Input */}
              <div className="grid grid-cols-4 items-center gap-1 text-[10px]">
                <label className="text-neutral-400 select-none">Title:</label>
                <input
                  type="text"
                  value={art.title}
                  onChange={(e) => onUpdateArtwork(index, { title: e.target.value })}
                  className="col-span-3 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-white transition focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Artist Input */}
              <div className="grid grid-cols-4 items-center gap-1 text-[10px]">
                <label className="text-neutral-400 select-none">Artist:</label>
                <input
                  type="text"
                  value={art.artist}
                  onChange={(e) => onUpdateArtwork(index, { artist: e.target.value })}
                  className="col-span-3 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-white transition focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Image URL Input */}
              <div className="grid grid-cols-4 items-center gap-1 text-[10px]">
                <label className="text-neutral-400 select-none">Image:</label>
                <input
                  type="text"
                  value={art.url}
                  onChange={(e) => onUpdateArtwork(index, { url: e.target.value })}
                  className="col-span-3 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-neutral-300 font-mono transition focus:outline-none focus:border-cyan-500 truncate"
                  title={art.url}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration walkthrough helper card */}
      <div className="bg-neutral-950/50 p-3 rounded-xl border border-white/5 space-y-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-neutral-300">
            Framer Deployment Method
          </span>
        </div>
        <ol className="text-[10px] text-neutral-400 list-decimal pl-4.5 space-y-1.5 leading-normal">
          <li>Create a blank Code Component named <code className="text-neutral-200 font-mono bg-white/5 px-1 py-0.2 rounded">SpiralHelixGallery</code> inside your Framer project workspace.</li>
          <li>Erase Framer's default code block entirely, and paste your copied clipboard component code within.</li>
          <li>Drag the new component on top of any page canvas, and select your Framer CMS Collection mapping inside the properties panel!</li>
        </ol>
      </div>
    </div>
  );
}
