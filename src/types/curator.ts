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
  annotation: string;
  subtitle: string;
  title: string;
  observation: string;
  why: string;
  next: string;
  cta: string;
};

export type CuratorCopy = CuratorCopyContent & {
  source: "openai" | "fallback";
};
