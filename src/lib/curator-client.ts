import { createFallbackCuratorCopy } from "@/lib/curator-fallback";
import type { ArtworkHotspot } from "@/types/artwork";
import type {
  CuratorCopy,
  CuratorGenerationInput,
} from "@/types/curator";

export type { CuratorCopy, CuratorGenerationInput } from "@/types/curator";

export async function generateCuratorCopy(
  input: CuratorGenerationInput,
  hotspot: ArtworkHotspot,
): Promise<CuratorCopy> {
  try {
    const response = await fetch("/api/curator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Curator request failed with ${response.status}`);
    }

    const copy = (await response.json()) as CuratorCopy;
    if (copy.source !== "openai" && copy.source !== "fallback") {
      throw new Error("Curator response did not identify its source");
    }

    return copy;
  } catch (error) {
    console.warn("[Look Closer][curator] browser fallback", {
      hotspotId: hotspot.id,
      storyIndex: hotspot.storyIndex,
      reason: error instanceof Error ? error.message : "unknown error",
    });
    return createFallbackCuratorCopy(input, hotspot);
  }
}
