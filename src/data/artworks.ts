import { Artwork, GalleryTheme } from "../types";

export const GALLERY_THEMES: GalleryTheme[] = [
  {
    id: "cosmic",
    name: "Cosmic Vistas",
    description: "Venturing into stellar nebulas, interstellar phenomena, and cosmic drift.",
    accentColor: "#ec4899", // pink-500
    bgGradient: "from-slate-950 via-purple-950 to-pink-950/40"
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Neons",
    description: "Hacker dens, neon reflections in wet rain, and mechanical city grids.",
    accentColor: "#06b6d4", // cyan-500
    bgGradient: "from-zinc-950 via-cyan-950/50 to-rose-950/30"
  },
  {
    id: "minimalist",
    name: "Ethereal Architecture",
    description: "Symmetrical concrete structures, clean light columns, and architectural geometry.",
    accentColor: "#f59e0b", // amber-500
    bgGradient: "from-stone-950 via-amber-950/20 to-neutral-950"
  },
  {
    id: "nature",
    name: "Mystic Nature",
    description: "Bio-luminescent floral glow, emerald canopies, and dense mystical forest peaks.",
    accentColor: "#10b981", // emerald-500
    bgGradient: "from-slate-950 via-emerald-950/30 to-teal-950/20"
  }
];

export const ARTWORKS_DATA: Artwork[] = [
  // --- COSMIC VISTAS ---
  {
    id: "cosmic-1",
    title: "Orion's Birthplace",
    artist: "Aria Thorne",
    url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80",
    description: "A billowing gas cloud of hydrogen and chemical dust lanes colored by infrared exposures, shining deep in the celestial core of Orion's arm. It captures the violent collapse and ignition of a solar stellar cluster.",
    category: "cosmic",
    year: "2025",
    cameraSpecs: {
      shutter: "1200s",
      iso: "Astro-800",
      aperture: "f/2.8 Prime",
      lens: "Schmidt-Cassegrain 280mm"
    }
  },
  {
    id: "cosmic-2",
    title: "Andromeda Gaze",
    artist: "Marcus Vance",
    url: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=800&q=80",
    description: "A wide-field mosaic exposure of our nearest galactic sister, tracing its stellar halo spinning across two and a half million light years. Shot on high-altitude cooled astro-sensor plates.",
    category: "cosmic",
    year: "2026",
    cameraSpecs: {
      shutter: "4.5 hours (Stacked)",
      iso: "ISO 1600",
      aperture: "f/4.0 Refractor",
      lens: "Takahashi FSQ-106ED"
    }
  },
  {
    id: "cosmic-3",
    title: "Nebula Veil Glow",
    artist: "Elena Rostova",
    url: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=800&q=80",
    description: "A supernova remnant captured in narrowband emission filters. Hydrogen-Alpha (red) and Oxygen-III (cyan) gas filaments writhe in high velocity shockwaves, sweeping through ancient galactic space.",
    category: "cosmic",
    year: "2024",
    cameraSpecs: {
      shutter: "900s x 16",
      iso: "Gain 100",
      aperture: "f/2.0 Hyperstar",
      lens: "Celestron RASA 11\""
    }
  },
  {
    id: "cosmic-4",
    title: "Singularity Threshold",
    artist: "Dr. Kenji Sato",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    description: "A mathematical raycast simulation visualizing the gravitationally bent lensed light disk surrounding a non-rotating massive black hole event horizon, highlighting general relativistic Doppler-beaming effects.",
    category: "cosmic",
    year: "2025",
    cameraSpecs: {
      shutter: "CGI/Rendered",
      iso: "64-bit Floating",
      aperture: "N/A",
      lens: "Raymarch Shader-F4"
    }
  },

  // --- CYBERPUNK NEONS ---
  {
    id: "cyber-1",
    title: "Neon Flood, Akihabara",
    artist: "Sora Takahashi",
    url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    description: "Reflections of multi-level commercial billboards cascading off wet asphalt in Tokyo's electric district. The chromatic dispersion of magenta and neon cyan creates an immersive cybernetic landscape in the pouring rain.",
    category: "cyberpunk",
    year: "2026",
    cameraSpecs: {
      shutter: "1/125s",
      iso: "ISO 3200",
      aperture: "f/1.4",
      lens: "50mm f/1.4 Summilux"
    }
  },
  {
    id: "cyber-2",
    title: "The Grid Protocols",
    artist: "Viktor Vane",
    url: "https://images.unsplash.com/photo-1515260268569-9271009adfdb?auto=format&fit=crop&w=800&q=80",
    description: "An look inside an mainframe server array. Glowing blue optical fibers, ethernet bundles, and temperature readout LED matrices create a virtual highway of telemetry flowing through modern networks.",
    category: "cyberpunk",
    year: "2025",
    cameraSpecs: {
      shutter: "1/30s",
      iso: "ISO 2000",
      aperture: "f/2.8 Macro",
      lens: "90mm f/2.8 G-Master"
    }
  },
  {
    id: "cyber-3",
    title: "Chiba Drift",
    artist: "Gwen Stacy",
    url: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=800&q=80",
    description: "Long-exposure panning of high-speed urban transit racing above elevated metropolitan expressways. Light trails bleed into neon streaks, illustrating cybernetic friction and velocity dynamics.",
    category: "cyberpunk",
    year: "2024",
    cameraSpecs: {
      shutter: "1.2s (Panning)",
      iso: "ISO 100",
      aperture: "f/11",
      lens: "24-70mm Zoom"
    }
  },
  {
    id: "cyber-4",
    title: "Hologram Alleyway",
    artist: "Jax Vance",
    url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    description: "A dark cyberpunk sensory overload featuring custom visual advertising holograms. A synthetic marketing terminal project glows with hyper-real avatars overlooking pedestrian corridors.",
    category: "cyberpunk",
    year: "2025",
    cameraSpecs: {
      shutter: "1/80s",
      iso: "ISO 1600",
      aperture: "f/1.8",
      lens: "35mm Prime S-Line"
    }
  },

  // --- MINIMALIST ARCHITECTURE ---
  {
    id: "minimal-1",
    title: "Concrete Curvature No. 4",
    artist: "Jean-Laurent",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    description: "The interplay of soft light and hard architectural Brutalism. Raw poured concrete curves meet sharp diagonal shadows, creating an essay in balance, negative space, and tonal gradients in high-contrast monochromes.",
    category: "minimalist",
    year: "2025",
    cameraSpecs: {
      shutter: "1/200s",
      iso: "ISO 64",
      aperture: "f/8.0",
      lens: "24mm Tilt-Shift f/3.5"
    }
  },
  {
    id: "minimal-2",
    title: "The Oasis Column",
    artist: "Dieter Ramsa",
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    description: "A singular cylindrical architectural pillar catching a sharp bar of overhead sunlight. Minimal warm beige sandstone panels highlight the structural purity and tranquil geometry of the courtyard.",
    category: "minimalist",
    year: "2024",
    cameraSpecs: {
      shutter: "1/400s",
      iso: "ISO 100",
      aperture: "f/5.6",
      lens: "85mm f/1.2 Otus"
    }
  },
  {
    id: "minimal-3",
    title: "Volcanic Monolith",
    artist: "Kira Nyström",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    description: "An isolated glass skyscraper clad in dark matte composite plates rising into low overcast sky, resembling an ominous geological monolith carved out of obsidian or compressed basalt.",
    category: "minimalist",
    year: "2026",
    cameraSpecs: {
      shutter: "1/1000s",
      iso: "ISO 200",
      aperture: "f/6.3",
      lens: "135mm f/1.8 G Series"
    }
  },
  {
    id: "minimal-4",
    title: "Corridors of Silence",
    artist: "Tadao Ando",
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    description: "Soft gray walls showing microscopic bubble texturing, flanking an endless symmetrical corridor. Skylight tubes throw vertical pillars of white illumination down onto the silent polished floor.",
    category: "minimalist",
    year: "2025",
    cameraSpecs: {
      shutter: "1/60s",
      iso: "ISO 400",
      aperture: "f/4.5",
      lens: "14-24mm Ultra-Wide"
    }
  },

  // --- MYSTIC NATURE ---
  {
    id: "nature-1",
    title: "Bioluminescent Canopy",
    artist: "Fiona Greenwood",
    url: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=800&q=80",
    description: "Deep in the Redwood Grove of Northern California. Thick marine fog drifting through towering trees catches bioluminescent cyan spores and rich forest canopy filtering, evoking prehistoric magic.",
    category: "nature",
    year: "2025",
    cameraSpecs: {
      shutter: "30s",
      iso: "ISO 1600",
      aperture: "f/2.8",
      lens: "28mm f/1.4 Art"
    }
  },
  {
    id: "nature-2",
    title: "Mossy Geothermal Flow",
    artist: "Sigurður Jónsson",
    url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80",
    description: "Vibrant fluorescent geothermal green mosses cascading around rich steam vents in Iceland's highlands. Soft mineral pools create perfect, emerald, glass-like reflective circles under dark cloud mist.",
    category: "nature",
    year: "2026",
    cameraSpecs: {
      shutter: "1/15s (ND Filter)",
      iso: "ISO 100",
      aperture: "f/13",
      lens: "16-35mm Tilt-Shift"
    }
  },
  {
    id: "nature-3",
    title: "Dewdrops of the Void",
    artist: "Oliver Vance",
    url: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80",
    description: "Extremely high magnification macro photography of dew suspended on a delicate forest fern leaf. The refraction in each water sphere exposes sharp upside-down worlds of the surrounding deep forest.",
    category: "nature",
    year: "2024",
    cameraSpecs: {
      shutter: "1/250s",
      iso: "ISO 250",
      aperture: "f/16 (Macro Ring-Flash)",
      lens: "Laowa 100mm 2x Ultra Macro"
    }
  },
  {
    id: "nature-4",
    title: "Emerald Veil Mountains",
    artist: "Li Wei",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    description: "A wide panoramic landscape capturing misty volcanic peaks of the Guilin karst formations, draped in ancient vines and wet bamboos reflecting under an early morning emerald green sky.",
    category: "nature",
    year: "2025",
    cameraSpecs: {
      shutter: "1/4s (Grad Shift)",
      iso: "ISO 50",
      aperture: "f/11",
      lens: "Omega Tilt Horizon"
    }
  }
];
