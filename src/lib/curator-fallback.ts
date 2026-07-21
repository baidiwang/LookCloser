import type { ArtworkHotspot } from "@/types/artwork";
import type {
  CuratorCopy,
  CuratorGenerationInput,
} from "@/types/curator";

export function createFallbackCuratorCopy(
  input: CuratorGenerationInput,
  hotspot: ArtworkHotspot,
): CuratorCopy {
  const isReturnVisit = input.hotspotVisitCount > 1;
  const [firstSeed, ...remainingSeeds] = hotspot.storySeeds;

  const observationLine =
    input.hotspotVisitCount >= 3
      ? "Your attention keeps returning here."
      : isReturnVisit
        ? "You came back to this detail."
        : "I noticed your attention settled here.";

  return {
    observationLine,
    annotationText: hotspot.factualSeed,
    storyTitle: hotspot.label,
    whyItMatters: firstSeed ?? hotspot.factualSeed,
    noticeNext: remainingSeeds.join(" ") || hotspot.factualSeed,
    ctaLabel: isReturnVisit ? "Continue looking" : "Return to the painting",
    source: "fallback",
  };
}
