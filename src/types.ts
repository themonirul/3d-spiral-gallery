export interface Artwork {
  id: string;
  title: string;
  artist: string;
  url: string;
  description: string;
  category: string;
  year: string;
  cameraSpecs?: {
    shutter: string;
    iso: string;
    aperture: string;
    lens: string;
  };
}

export interface GalleryTheme {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  bgGradient: string;
}

export interface HelixSettings {
  radius: number;
  verticalGap: number;
  angleGap: number;
  autoScrollSpeed: number;
  focusMode: boolean;
  bowingStrength: number;
  scrollSpeedLag: number;
}
