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

  const annotation =
    input.hotspotVisitCount >= 3
      ? "Your attention keeps returning here."
      : isReturnVisit
        ? "You came back to this detail."
        : "I noticed your attention settled here.";

  return {
    annotation,
    subtitle: hotspot.factualSeed,
    title: hotspot.label,
    observation: firstSeed ?? hotspot.factualSeed,
    why: remainingSeeds[0] ?? firstSeed ?? hotspot.factualSeed,
    next: remainingSeeds.slice(1).join(" ") || hotspot.factualSeed,
    cta: isReturnVisit ? "Continue looking" : "Return to the painting",
    source: "fallback",
  };
}
