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
    storyParagraphs: {
      type: "array",
      minItems: 2,
      maxItems: 2,
      items: { type: "string" },
      description: "Exactly two concise curator-style story paragraphs.",
    },
    ctaLabel: {
      type: "string",
      description:
        "A short invitation to return to or continue exploring the painting.",
    },
  },
  required: [
    "observationLine",
    "annotationText",
    "storyTitle",
    "storyParagraphs",
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
    Array.isArray(copy.storyParagraphs) &&
    copy.storyParagraphs.length === 2 &&
    copy.storyParagraphs.every((paragraph) => typeof paragraph === "string") &&
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
    typeof input.dwellTimeMs !== "number" ||
    !Number.isFinite(input.dwellTimeMs) ||
    !Array.isArray(input.visitedHotspotIds) ||
    !Array.isArray(input.priorCuriosityNotes)
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
    dwellTimeMs: Math.min(Math.max(Math.round(input.dwellTimeMs), 0), 30_000),
    visitedHotspotIds: input.visitedHotspotIds
      .filter((id): id is string => typeof id === "string")
      .slice(-6),
    priorCuriosityNotes: input.priorCuriosityNotes
      .filter((note): note is string => typeof note === "string")
      .map((note) => note.slice(0, 240))
      .slice(-6),
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

  const fallback = () => NextResponse.json(createFallbackCuratorCopy(input, hotspot));
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) return fallback();

  const hasVisitedBefore = input.visitedHotspotIds.includes(hotspot.id);
  const curatorContext = {
    artwork: input.artwork,
    attention: {
      hotspotId: hotspot.id,
      hotspotLabel: hotspot.label,
      dwellTimeMs: input.dwellTimeMs,
      isReturnVisit: hasVisitedBefore,
      visitedHotspotIds: input.visitedHotspotIds,
      priorCuriosityNotes: input.priorCuriosityNotes,
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
        max_output_tokens: 520,
        instructions: [
          "You are the quiet curator inside an immersive museum exhibition.",
          "Write in refined, restrained English with an observant human voice—not a chatbot voice.",
          "The first line must notice the visitor's attention behavior. If this is a return visit, acknowledge that they came back.",
          "Keep the annotation suspenseful and 8–18 words. Do not explain everything there.",
          "Ground every art claim only in the verified factual and story seeds. Never invent details.",
          "Write exactly two story paragraphs, each 35–65 words, as a curator continuing the moment the visitor noticed.",
          "Avoid AI-product language, rhetorical filler, and exclamation marks.",
          "End with a CTA that invites the visitor back into the painting.",
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
