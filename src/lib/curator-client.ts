import type { ArtworkMetadata, ArtworkHotspot } from "@/types/artwork";

export const FUTURE_CURATOR_MODEL = "gpt-5.6-sol" as const;

export type CuratorGenerationInput = {
  artwork: Pick<ArtworkMetadata, "id" | "title" | "artist" | "date" | "location">;
  hotspotId: string;
  dwellTimeMs: number;
  visitedHotspotIds: string[];
};

export type CuratorCopy = {
  label: string;
  curiosityLine: string;
  storyTitle: string;
  storyText: string;
};

/**
 * Deterministic local adapter for the hackathon demo.
 *
 * Future integration boundary: replace this body with a call to a server-side
 * `/api/curator` route using the Responses API. Keep API keys and model calls
 * on the server; the UI should continue to send only CuratorGenerationInput.
 */
export async function generateCuratorCopy(
  input: CuratorGenerationInput,
  hotspot: ArtworkHotspot,
): Promise<CuratorCopy> {
  void input;

  return {
    label: hotspot.label,
    curiosityLine: hotspot.curiosityLine,
    storyTitle: hotspot.storyTitle,
    storyText: hotspot.storyText,
  };
}
