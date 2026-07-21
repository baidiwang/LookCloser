export type HotspotRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type AnnotationAnchorDirection = "left" | "right" | "top" | "bottom";

export type AnnotationPlacement = {
  /** The side of the attention point on which the curator note should open. */
  direction: AnnotationAnchorDirection;
  /** A small viewport-pixel adjustment for visually asymmetric details. */
  offset?: ViewportPoint;
};

export type ArtworkHotspot = {
  id: string;
  region: HotspotRegion;
  annotationPlacement?: AnnotationPlacement;
  label: string;
  factualSeed: string;
  storySeeds: string[];
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

export type ViewportPoint = {
  x: number;
  y: number;
};

export type AttentionEvent = {
  hotspot: ArtworkHotspot;
  point: NormalizedPoint;
  viewportPoint: ViewportPoint;
  dwellTimeMs: number;
};

export type PointerAttentionEvent = {
  point: NormalizedPoint;
  viewportPoint: ViewportPoint;
  hotspot: ArtworkHotspot | null;
};
