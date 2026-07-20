export type HotspotRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ArtworkHotspot = {
  id: string;
  region: HotspotRegion;
  label: string;
  curiosityLine: string;
  storyTitle: string;
  storyText: string;
  storyIndex: string;
};

export type ArtworkMetadata = {
  id: string;
  title: string;
  artist: string;
  date: string;
  location: string;
  imageSrc: string;
  imageAlt: string;
  hotspots: ArtworkHotspot[];
};

export type NormalizedPoint = {
  x: number;
  y: number;
};

export type AttentionEvent = {
  hotspot: ArtworkHotspot;
  point: NormalizedPoint;
  dwellTimeMs: number;
};
