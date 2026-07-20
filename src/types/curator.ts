import type { ArtworkMetadata } from "@/types/artwork";

export type CuratorGenerationInput = {
  artwork: Pick<
    ArtworkMetadata,
    "id" | "title" | "artist" | "date" | "location"
  >;
  hotspotId: string;
  dwellTimeMs: number;
  visitedHotspotIds: string[];
  priorCuriosityNotes: string[];
};

export type CuratorCopyContent = {
  observationLine: string;
  annotationText: string;
  storyTitle: string;
  storyParagraphs: string[];
  ctaLabel: string;
};

export type CuratorCopy = CuratorCopyContent & {
  source: "openai" | "fallback";
};
