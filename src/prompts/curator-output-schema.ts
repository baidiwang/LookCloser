import type { CuratorCopyContent } from "@/types/curator";

export const CURATOR_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    annotation: {
      type: "string",
      description:
        "The opening attention acknowledgement. It must recognize the visitor before mentioning artwork facts.",
    },
    subtitle: {
      type: "string",
      description:
        "A brief curiosity-building line grounded in the supplied artwork context.",
    },
    title: {
      type: "string",
      description: "A concise editorial title specific to this detail.",
    },
    observation: {
      type: "string",
      description: "One restrained visual observation about the selected detail.",
    },
    why: {
      type: "string",
      description:
        "A short explanation of why the observation matters in the composition.",
    },
    next: {
      type: "string",
      description:
        "A visual invitation back into the painting that leaves a subtle mystery unresolved.",
    },
    cta: {
      type: "string",
      enum: ["Return to the painting", "Continue looking", "Keep exploring"],
      description: "A restrained invitation to continue looking.",
    },
  },
  required: [
    "annotation",
    "subtitle",
    "title",
    "observation",
    "why",
    "next",
    "cta",
  ],
  additionalProperties: false,
} as const;

export function isCuratorCopyContent(
  value: unknown,
): value is CuratorCopyContent {
  if (!value || typeof value !== "object") return false;
  const copy = value as Partial<CuratorCopyContent>;

  return (
    typeof copy.annotation === "string" &&
    typeof copy.subtitle === "string" &&
    typeof copy.title === "string" &&
    typeof copy.observation === "string" &&
    typeof copy.why === "string" &&
    typeof copy.next === "string" &&
    typeof copy.cta === "string"
  );
}
