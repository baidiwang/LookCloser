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

    return (await response.json()) as CuratorCopy;
  } catch {
    return createFallbackCuratorCopy(input, hotspot);
  }
}
