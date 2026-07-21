import type { ArtworkMetadata } from "@/types/artwork";

export type CuratorGenerationInput = {
  artwork: Pick<
    ArtworkMetadata,
    "id" | "title" | "artist" | "date" | "location"
  >;
  hotspotId: string;
  hotspotLabel: string;
  hotspotVisitCount: number;
  dwellTimeMs: number;
  visitedHotspotIds: string[];
  priorCuriosityNotes: string[];
  interactionStage: "attention-reveal" | "story-expansion";
};

export type CuratorCopyContent = {
  observationLine: string;
  annotationText: string;
  storyTitle: string;
  whyItMatters: string;
  noticeNext: string;
  ctaLabel: string;
};

export type CuratorCopy = CuratorCopyContent & {
  source: "openai" | "fallback";
};
