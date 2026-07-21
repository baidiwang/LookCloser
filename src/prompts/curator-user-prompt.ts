import type { ArtworkHotspot } from "@/types/artwork";
import type { CuratorGenerationInput } from "@/types/curator";

export type AttentionPattern = "settled" | "returned" | "repeated";

export function getAttentionPattern(
  input: CuratorGenerationInput,
): AttentionPattern {
  if (input.hotspotVisitCount >= 3) return "repeated";
  if (
    input.hotspotVisitCount > 1 ||
    input.visitedHotspotIds.includes(input.hotspotId)
  ) {
    return "returned";
  }
  return "settled";
}

export function buildCuratorUserPrompt(
  input: CuratorGenerationInput,
  hotspot: ArtworkHotspot,
) {
  const attentionPattern = getAttentionPattern(input);
  const context = {
    artwork: input.artwork.title,
    artworkMetadata: input.artwork,
    hotspotId: hotspot.id,
    hotspotLabel: hotspot.label,
    storyIndex: hotspot.storyIndex,
    visitCount: input.hotspotVisitCount,
    visitedHotspots: input.visitedHotspotIds,
    hoverDuration: Number((input.dwellTimeMs / 1000).toFixed(2)),
    attentionPattern,
    interactionStage:
      input.interactionStage === "attention-reveal" ? "annotation" : "story",
    priorCuriosityNotes: input.priorCuriosityNotes,
    verifiedArtworkContext: {
      factualSeed: hotspot.factualSeed,
      deeperStorySeeds: hotspot.storySeeds,
    },
    writingRequirements: {
      annotation:
        attentionPattern === "settled"
          ? "One short sentence acknowledging that the visitor's attention settled here. Do not explain the artwork in this sentence."
          : attentionPattern === "returned"
            ? "One short sentence acknowledging that the visitor came back to this detail. Do not explain the artwork in this sentence."
            : "One short sentence gently recognizing that this detail keeps drawing the visitor back. Do not explain the artwork in this sentence.",
      subtitle:
        "One curiosity-building sentence grounded in the verified artwork context. Do not explain everything.",
      title: "A brief, editorial curator title specific to this hotspot.",
      observation:
        "One concise observation that reveals a single visual insight from the verified context.",
      why: "One short paragraph explaining why that insight matters in the composition.",
      next: "One short visual invitation that returns the visitor's gaze to the painting while leaving a subtle mystery unresolved.",
      cta: "Choose Return to the painting, Continue looking, or Keep exploring.",
      principles: [
        "Assume the visitor is intelligent. Never over-explain.",
        "Ground every artwork claim only in the verified context.",
        "Keep each field concise, calm, restrained, and free of exclamation marks.",
        "Make the response specific to this hotspot and this visitor journey.",
      ],
    },
  };

  return JSON.stringify(context);
}
