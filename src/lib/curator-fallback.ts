import type { ArtworkHotspot } from "@/types/artwork";
import type {
  CuratorCopy,
  CuratorGenerationInput,
} from "@/types/curator";

export function createFallbackCuratorCopy(
  input: CuratorGenerationInput,
  hotspot: ArtworkHotspot,
): CuratorCopy {
  const isReturnVisit = input.visitedHotspotIds.includes(hotspot.id);
  const [firstSeed, ...remainingSeeds] = hotspot.storySeeds;

  return {
    observationLine: isReturnVisit
      ? "You came back to this detail."
      : "I noticed your attention settled here.",
    annotationText: hotspot.factualSeed,
    storyTitle: hotspot.label,
    storyParagraphs: [
      firstSeed ?? hotspot.factualSeed,
      remainingSeeds.join(" ") || hotspot.factualSeed,
    ],
    ctaLabel: isReturnVisit ? "Look again" : "Return to the painting",
    source: "fallback",
  };
}
