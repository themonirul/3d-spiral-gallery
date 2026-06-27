import { useState, useTransition, useMemo } from "react";
import {
  Compass,
  Cpu,
  Bookmark,
  Eye,
  EyeOff,
  Sparkles,
  Heart,
  Sliders,
  Maximize2,
  Minimize2,
  Calendar,
  Layers,
  HelpCircle,
  Database
} from "lucide-react";
import { ARTWORKS_DATA, GALLERY_THEMES } from "./data/artworks";
import { Artwork, HelixSettings } from "./types";
import SpiralGallery from "./components/SpiralGallery";
import ControlHUD from "./components/ControlHUD";
import DetailOverlay from "./components/DetailOverlay";
import AICuratorPanel from "./components/AICuratorPanel";
import ArtworkUploader from "./components/ArtworkUploader";
import FramerExporter from "./components/FramerExporter";

export default function App() {
  const [artworks, setArtworks] = useState<Artwork[]>(ARTWORKS_DATA);
  const [activeThemeId, setActiveThemeId] = useState<string>("cosmic");
  
  // Initialize the first artwork of the active category as selected
  const initialSelected = useMemo(() => {
    const matching = artworks.filter((art) => art.category === "cosmic");
    return matching.length > 0 ? matching[0] : null;
  }, [artworks]);

  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(initialSelected);

  // Default Three.js Cylindrical physical settings
  const [helixSettings, setHelixSettings] = useState<HelixSettings>({
    radius: 1.9,
    verticalGap: 0.45,
    angleGap: 0.85,
    autoScrollSpeed: 0.002,
    focusMode: true,
    bowingStrength: 1.25,
    scrollSpeedLag: 1.1,
  });

  // UI interface visibility toggles
  const [isUiVisible, setIsUiVisible] = useState<boolean>(true);
  const [activeLeftTab, setActiveLeftTab] = useState<"physics" | "uploader" | "framer">("framer");
  const [activeRightTab, setActiveRightTab] = useState<"details" | "curator">("details");

  const [isPending, startTransition] = useTransition();

  // Find active theme specifications
  const activeTheme = useMemo(() => {
    return GALLERY_THEMES.find((theme) => theme.id === activeThemeId) || GALLERY_THEMES[0];
  }, [activeThemeId]);

  // Filter artworks by active category
  const filteredArtworks = useMemo(() => {
    return artworks.filter(
      (artwork) => artwork.category === activeThemeId || artwork.category === "Uploads"
    );
  }, [artworks, activeThemeId]);

  // Handle category switching
  const handleThemeChange = (themeId: string) => {
    startTransition(() => {
      setActiveThemeId(themeId);
      // Automatically select the first artwork of the selected playlist
      const matching = artworks.filter((art) => art.category === themeId || art.category === "Uploads");
      if (matching.length > 0) {
        setSelectedArtwork(matching[0]);
      }
    });
  };

  // Handle uploading dynamic custom artwork files
  const handleAddArtwork = (newArt: Artwork) => {
    setArtworks((prev) => [newArt, ...prev]);
    setSelectedArtwork(newArt);
    setActiveThemeId("Uploads");
  };

  // Handle updating artwork fields in-place (Framer CMS Sandbox simulation)
  const handleUpdateArtwork = (index: number, updatedFields: Partial<Artwork>) => {
    setArtworks((prev) => {
      const updated = [...prev];
      const targetInFiltered = filteredArtworks[index];
      if (targetInFiltered) {
        const globalIndex = prev.findIndex((art) => art.id === targetInFiltered.id);
        if (globalIndex !== -1) {
          updated[globalIndex] = {
            ...updated[globalIndex],
            ...updatedFields,
          };
          
          // Re-update selected artwork so detail overlay matches
          if (selectedArtwork && selectedArtwork.id === targetInFiltered.id) {
            setSelectedArtwork(updated[globalIndex]);
          }
        }
      }
      return updated;
    });
  };

  // Smoothly trigger AI curator panel targeting
  const handleAskAICurator = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setActiveRightTab("curator");
  };

  const formattedUTCString = "2026-06-18 23:54:02 UTC";

  return (
    <div
      className={`relative w-full h-screen overflow-hidden bg-gradient-to-br ${activeTheme.bgGradient} transition-all duration-1000 flex flex-col`}
    >
      {/* 3D WebGL Canvas Layer */}
      <SpiralGallery
        artworks={filteredArtworks}
        onSelectArtwork={setSelectedArtwork}
        settings={helixSettings}
        currentTime={formattedUTCString}
      />

      {/* Floating Header UI */}
      <header
        id="app-header-bar"
        className={`fixed top-0 left-0 w-full p-4 md:p-6 flex justify-between items-start z-30 transition-all duration-700 pointer-events-none ${
          isUiVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
        }`}
      >
        {/* Title Brand Metas */}
        <div className="pointer-events-auto bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 p-4 max-w-sm">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5" style={{ color: activeTheme.accentColor }} />
            <h1 className="font-display font-bold text-base md:text-lg tracking-tight text-white uppercase">
              Helix Spiral 3.0
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-1.5 font-mono text-[9px] tracking-wider text-neutral-400">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 animate-spin-slow" /> CYLINDER_TRACK_ACTIVE
            </span>
            <span>•</span>
            <span className="text-[10px] lowercase" style={{ color: activeTheme.accentColor }}>
              {filteredArtworks.length} elements mapped
            </span>
          </div>
        </div>

        {/* Global interface triggers */}
        <div className="flex items-center gap-2 pointer-events-auto shrink-0">
          <button
            onClick={() => setIsUiVisible(!isUiVisible)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-black/50 hover:bg-neutral-900 border border-white/10 rounded-xl font-sans text-xs font-semibold text-white transition hover:border-white/20 shadow-lg"
            title={isUiVisible ? "Enter Screen Immersive Mode" : "Return Control Deck Overlays"}
          >
            {isUiVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{isUiVisible ? "Immersive Mode" : "Exit"}</span>
          </button>
        </div>
      </header>

      {/* Immersive HUD notification */}
      {!isUiVisible && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40 bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-mono tracking-widest uppercase text-neutral-400 px-4 py-2 rounded-full pointer-events-auto cursor-pointer animate-pulse hover:text-white transition"
             onClick={() => setIsUiVisible(true)}>
          Press Esc / Click here to return physical overlays
        </div>
      )}

      {/* Primary Desktop Sidebar layouts */}
      <div className="absolute inset-x-0 top-20 bottom-24 p-4 md:p-6 flex justify-between pointer-events-none z-20">
        {/* LEFT COLUMN: Controls Dashboard & Uploader Form */}
        <div
          className={`flex flex-col gap-4 w-full md:w-80 pointer-events-auto transition-all duration-700 ${
            isUiVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
          }`}
        >
          {/* Section Selector Tab Pills */}
          <div className="flex bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/5 shrink-0">
            <button
              onClick={() => setActiveLeftTab("physics")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] tracking-wider uppercase font-mono font-medium transition ${
                activeLeftTab === "physics" ? "bg-white/10 text-white font-bold" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Lab Specs</span>
            </button>
            <button
              onClick={() => setActiveLeftTab("uploader")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] tracking-wider uppercase font-mono font-medium transition ${
                activeLeftTab === "uploader" ? "bg-white/10 text-white font-bold" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Curation</span>
            </button>
            <button
              onClick={() => setActiveLeftTab("framer")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] tracking-wider uppercase font-mono font-medium transition ${
                activeLeftTab === "framer" ? "bg-white/10 text-white font-bold" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Framer</span>
            </button>
          </div>

          {/* Active section deck panels */}
          <div className="flex-1 overflow-y-auto max-h-[82%] pointer-events-auto pr-1">
            {activeLeftTab === "physics" && (
              <ControlHUD
                settings={helixSettings}
                onUpdateSettings={setHelixSettings}
                activeThemeColor={activeTheme.accentColor}
              />
            )}
            {activeLeftTab === "uploader" && (
              <div className="space-y-4">
                <ArtworkUploader onAddArtwork={handleAddArtwork} activeThemeColor={activeTheme.accentColor} />
                <div className="bg-neutral-900/60 backdrop-blur-md rounded-2xl border border-white/5 p-4 text-[10px] font-mono text-neutral-400 leading-relaxed">
                  <div className="flex items-center gap-1 text-white mb-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Controls Guide</span>
                  </div>
                  Drag, flick, or swipe inside the 3D grid space to spin the cylindrical helix. Hover pieces to expand, and click to inspect details or summon the AI co-pilot.
                </div>
              </div>
            )}
            {activeLeftTab === "framer" && (
              <FramerExporter
                artworks={filteredArtworks}
                onUpdateArtwork={handleUpdateArtwork}
                activeThemeColor={activeTheme.accentColor}
              />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Details & AI chat portal */}
        <div
          className={`flex flex-col gap-4 w-full md:w-96 pointer-events-auto transition-all duration-700 ${
            isUiVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
          }`}
        >
          {/* Section Selector Tab Pills */}
          <div className="flex bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/5 shrink-0 ml-auto w-full">
            <button
              onClick={() => setActiveRightTab("details")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] tracking-wider uppercase font-mono font-medium transition ${
                activeRightTab === "details" ? "bg-white/10 text-white font-bold" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Specs Inspect</span>
            </button>
            <button
              onClick={() => setActiveRightTab("curator")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] tracking-wider uppercase font-mono font-medium transition ${
                activeRightTab === "curator" ? "bg-white/10 text-white font-bold" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Curator</span>
            </button>
          </div>

          {/* Active section details */}
          <div className="flex-1 overflow-hidden" id="details-viewer-deck">
            {activeRightTab === "details" ? (
              <DetailOverlay
                artwork={selectedArtwork}
                onClose={() => setSelectedArtwork(null)}
                onAskAI={handleAskAICurator}
                activeThemeColor={activeTheme.accentColor}
              />
            ) : (
              <AICuratorPanel selectedArtwork={selectedArtwork} activeThemeColor={activeTheme.accentColor} />
            )}
          </div>
        </div>
      </div>

      {/* Floating Bottom Navigation: Curated Playlist Selector */}
      <footer
        id="app-bottom-switcher"
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-30 transition-all duration-700 pointer-events-none w-full max-w-2xl px-4 ${
          isUiVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        <div className="pointer-events-auto bg-neutral-950/80 backdrop-blur-md rounded-2xl border border-white/10 p-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xl">
          <div className="text-center md:text-left shrink-0">
            <span className="text-[10px] font-mono text-neutral-500 block uppercase tracking-wider">
              Playlists Curator
            </span>
            <span className="text-white font-sans text-xs font-semibold tracking-wide">
              {activeTheme.name}
            </span>
          </div>

          {/* Topic filter switcher pills */}
          <div className="flex gap-1 overflow-x-auto w-full md:w-auto p-0.5 justify-center">
            {GALLERY_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`py-1.5 px-3.5 rounded-xl text-[10px] uppercase tracking-wider font-semibold transition shrink-0 ${
                  activeThemeId === theme.id
                    ? "text-black shadow-md font-bold"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
                style={{
                  backgroundColor: activeThemeId === theme.id ? theme.accentColor : undefined,
                }}
              >
                {theme.id}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
