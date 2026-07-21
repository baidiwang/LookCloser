import { NextResponse } from "next/server";
import { lastSupperArtwork } from "@/data/last-supper";
import { createFallbackCuratorCopy } from "@/lib/curator-fallback";
import type { CuratorCopyContent, CuratorGenerationInput } from "@/types/curator";

export const runtime = "nodejs";

const CURATOR_MODEL = process.env.OPENAI_CURATOR_MODEL ?? "gpt-5.6-sol";

const curatorSchema = {
  type: "object",
  properties: {
    observationLine: {
      type: "string",
      description:
        "A brief human observation about where or how the visitor's attention lingered.",
    },
    annotationText: {
      type: "string",
      description:
        "A suspenseful factual curiosity note grounded only in the supplied seeds.",
    },
    storyTitle: {
      type: "string",
      description: "An elegant editorial title for the deeper curator note.",
    },
    whyItMatters: {
      type: "string",
      description:
        "A concise curator explanation of why the observed detail matters in the composition.",
    },
    noticeNext: {
      type: "string",
      description:
        "A short visual direction that sends the visitor's eyes to a related detail in the painting.",
    },
    ctaLabel: {
      type: "string",
      enum: ["Return to the painting", "Continue looking", "Keep exploring"],
      description:
        "A short invitation to return to or continue exploring the painting.",
    },
  },
  required: [
    "observationLine",
    "annotationText",
    "storyTitle",
    "whyItMatters",
    "noticeNext",
    "ctaLabel",
  ],
  additionalProperties: false,
} as const;

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

function extractOutputText(response: OpenAIResponse) {
  if (response.output_text) return response.output_text;

  for (const item of response.output ?? []) {
    if (item.type !== "message") continue;
    const output = item.content?.find((content) => content.type === "output_text");
    if (output?.text) return output.text;
  }

  return null;
}

function isCuratorCopyContent(value: unknown): value is CuratorCopyContent {
  if (!value || typeof value !== "object") return false;
  const copy = value as Partial<CuratorCopyContent>;

  return (
    typeof copy.observationLine === "string" &&
    typeof copy.annotationText === "string" &&
    typeof copy.storyTitle === "string" &&
    typeof copy.whyItMatters === "string" &&
    typeof copy.noticeNext === "string" &&
    typeof copy.ctaLabel === "string"
  );
}

function sanitizeInput(value: unknown): CuratorGenerationInput | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Partial<CuratorGenerationInput>;
  const artwork = input.artwork;

  if (
    !artwork ||
    artwork.id !== lastSupperArtwork.id ||
    typeof input.hotspotId !== "string" ||
    typeof input.hotspotLabel !== "string" ||
    typeof input.hotspotVisitCount !== "number" ||
    !Number.isFinite(input.hotspotVisitCount) ||
    typeof input.dwellTimeMs !== "number" ||
    !Number.isFinite(input.dwellTimeMs) ||
    !Array.isArray(input.visitedHotspotIds) ||
    !Array.isArray(input.priorCuriosityNotes) ||
    (input.interactionStage !== "attention-reveal" &&
      input.interactionStage !== "story-expansion")
  ) {
    return null;
  }

  return {
    artwork: {
      id: lastSupperArtwork.id,
      title: lastSupperArtwork.title,
      artist: lastSupperArtwork.artist,
      date: lastSupperArtwork.date,
      location: lastSupperArtwork.location,
    },
    hotspotId: input.hotspotId,
    hotspotLabel: input.hotspotLabel.slice(0, 120),
    hotspotVisitCount: Math.min(
      Math.max(Math.round(input.hotspotVisitCount), 1),
      20,
    ),
    dwellTimeMs: Math.min(Math.max(Math.round(input.dwellTimeMs), 0), 30_000),
    visitedHotspotIds: input.visitedHotspotIds
      .filter((id): id is string => typeof id === "string")
      .slice(-6),
    priorCuriosityNotes: input.priorCuriosityNotes
      .filter((note): note is string => typeof note === "string")
      .map((note) => note.slice(0, 240))
      .slice(-6),
    interactionStage: input.interactionStage,
  };
}

export async function POST(request: Request) {
  const input = sanitizeInput(await request.json().catch(() => null));

  if (!input) {
    return NextResponse.json({ error: "Invalid curator request" }, { status: 400 });
  }

  const hotspot = lastSupperArtwork.hotspots.find(
    (candidate) => candidate.id === input.hotspotId,
  );

  if (!hotspot) {
    return NextResponse.json({ error: "Unknown hotspot" }, { status: 404 });
  }

  if (input.hotspotLabel !== hotspot.label) {
    return NextResponse.json(
      { error: "Hotspot label does not match artwork data" },
      { status: 400 },
    );
  }

  const fallback = () => NextResponse.json(createFallbackCuratorCopy(input, hotspot));
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) return fallback();

  const hasVisitedBefore = input.hotspotVisitCount > 1;
  const curatorContext = {
    artwork: input.artwork,
    attention: {
      hotspotId: hotspot.id,
      hotspotLabel: hotspot.label,
      hotspotVisitCount: input.hotspotVisitCount,
      dwellTimeMs: input.dwellTimeMs,
      isReturnVisit: hasVisitedBefore,
      visitedHotspotIds: input.visitedHotspotIds,
      priorCuriosityNotes: input.priorCuriosityNotes,
      interactionStage: input.interactionStage,
    },
    verifiedSeeds: {
      factualSeed: hotspot.factualSeed,
      deeperStorySeeds: hotspot.storySeeds,
    },
  };

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(12_000),
      body: JSON.stringify({
        model: CURATOR_MODEL,
        store: false,
        reasoning: { effort: "none" },
        max_output_tokens: 480,
        instructions: [
          "You are the quiet curator inside an immersive museum exhibition.",
          "Write in refined, restrained English with an observant human voice—not a chatbot voice.",
          "The first line must notice the visitor's attention behavior, not describe the artwork.",
          "For a first visit, acknowledge that their attention settled here. For a second visit, acknowledge that they came back. For three or more visits, gently notice the repeated pattern.",
          "Use prior notes and visited hotspot IDs only when they genuinely support a pattern; never invent a psychological profile.",
          "Keep the annotation suspenseful and 8–18 words. Do not explain everything there.",
          "Treat observationLine as the annotation intro and annotationText as its short subtitle.",
          "Ground every art claim only in the verified factual and story seeds. Never invent details.",
          "Write whyItMatters as one compact 22–38 word curator explanation.",
          "Write noticeNext as one visual direction of 14–26 words that sends the visitor's eyes back into the painting.",
          "Avoid AI-product language, rhetorical filler, and exclamation marks.",
          "Choose only one supplied exhibition CTA label.",
        ].join(" "),
        input: JSON.stringify(curatorContext),
        text: {
          verbosity: "low",
          format: {
            type: "json_schema",
            name: "look_closer_curator_copy",
            strict: true,
            schema: curatorSchema,
          },
        },
      }),
    });

    if (!response.ok) {
      console.error("OpenAI curator request failed", response.status);
      return fallback();
    }

    const responseData = (await response.json()) as OpenAIResponse;
    const outputText = extractOutputText(responseData);
    const parsed: unknown = outputText ? JSON.parse(outputText) : null;

    if (!isCuratorCopyContent(parsed)) return fallback();

    return NextResponse.json({ ...parsed, source: "openai" });
  } catch (error) {
    console.error(
      "OpenAI curator generation unavailable",
      error instanceof Error ? error.message : "unknown error",
    );
    return fallback();
  }
}
