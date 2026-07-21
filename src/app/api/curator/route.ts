import { NextResponse } from "next/server";
import { lastSupperArtwork } from "@/data/last-supper";
import { createFallbackCuratorCopy } from "@/lib/curator-fallback";
import {
  findHotspotById,
  validateHotspotMapping,
} from "@/lib/hotspot-mapping";
import {
  CURATOR_OUTPUT_SCHEMA,
  isCuratorCopyContent,
} from "@/prompts/curator-output-schema";
import { buildCuratorSystemPrompt } from "@/prompts/curator-system-prompt";
import {
  buildCuratorUserPrompt,
  getAttentionPattern,
} from "@/prompts/curator-user-prompt";
import type { CuratorGenerationInput } from "@/types/curator";

export const runtime = "nodejs";

const CURATOR_MODEL = process.env.OPENAI_CURATOR_MODEL ?? "gpt-5.6-sol";
const hotspotMappingIssues = validateHotspotMapping(lastSupperArtwork.hotspots);

if (hotspotMappingIssues.length > 0) {
  throw new Error(
    `[Look Closer] Invalid hotspot mapping: ${hotspotMappingIssues.join(", ")}`,
  );
}

type OpenAIResponse = {
  id?: string;
  model?: string;
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

function logCurator(
  level: "info" | "warn" | "error",
  event: string,
  details: Record<string, unknown>,
) {
  const message = `[Look Closer][curator] ${event} ${JSON.stringify(details)}`;
  console[level](message);
}

function extractOutputText(response: OpenAIResponse) {
  if (response.output_text) return response.output_text;

  for (const item of response.output ?? []) {
    if (item.type !== "message") continue;
    const output = item.content?.find((content) => content.type === "output_text");
    if (output?.text) return output.text;
  }

  return null;
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
  const requestId = crypto.randomUUID().slice(0, 8);
  const rawInput: unknown = await request.json().catch(() => null);
  const receivedHotspotId =
    rawInput &&
    typeof rawInput === "object" &&
    "hotspotId" in rawInput &&
    typeof rawInput.hotspotId === "string"
      ? rawInput.hotspotId
      : "invalid";
  const input = sanitizeInput(rawInput);

  logCurator("info", "request received", {
    requestId,
    hotspotId: receivedHotspotId,
    model: CURATOR_MODEL,
    apiKeyConfigured: Boolean(process.env.OPENAI_API_KEY),
  });

  if (!input) {
    logCurator("warn", "request rejected", {
      requestId,
      hotspotId: receivedHotspotId,
      reason: "invalid-request",
    });
    return NextResponse.json({ error: "Invalid curator request" }, { status: 400 });
  }

  const hotspot = findHotspotById(lastSupperArtwork.hotspots, input.hotspotId);

  if (!hotspot) {
    logCurator("warn", "request rejected", {
      requestId,
      hotspotId: input.hotspotId,
      reason: "unknown-hotspot",
    });
    return NextResponse.json({ error: "Unknown hotspot" }, { status: 404 });
  }

  logCurator("info", "hotspot resolved", {
    requestId,
    receivedHotspotId: input.hotspotId,
    resolvedHotspotId: hotspot.id,
    storyIndex: hotspot.storyIndex,
    hotspotLabel: hotspot.label,
  });

  if (input.hotspotLabel !== hotspot.label) {
    logCurator("warn", "request rejected", {
      requestId,
      hotspotId: input.hotspotId,
      reason: "label-mismatch",
    });
    return NextResponse.json(
      { error: "Hotspot label does not match artwork data" },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const fallback = (reason: string) => {
    logCurator("warn", "final response", {
      requestId,
      hotspotId: hotspot.id,
      storyIndex: hotspot.storyIndex,
      source: "fallback",
      reason,
    });
    return NextResponse.json(createFallbackCuratorCopy(input, hotspot));
  };

  if (!apiKey) return fallback("missing-api-key");

  const attentionPattern = getAttentionPattern(input);

  logCurator("info", "prompt context built", {
    requestId,
    hotspotId: hotspot.id,
    storyIndex: hotspot.storyIndex,
    visitCount: input.hotspotVisitCount,
    hoverDurationSeconds: input.dwellTimeMs / 1000,
    attentionPattern,
    interactionStage: input.interactionStage,
  });

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
        instructions: buildCuratorSystemPrompt(),
        input: buildCuratorUserPrompt(input, hotspot),
        text: {
          verbosity: "low",
          format: {
            type: "json_schema",
            name: "look_closer_curator_copy",
            strict: true,
            schema: CURATOR_OUTPUT_SCHEMA,
          },
        },
      }),
    });

    if (!response.ok) {
      logCurator("error", "OpenAI request failed", {
        requestId,
        hotspotId: hotspot.id,
        storyIndex: hotspot.storyIndex,
        status: response.status,
      });
      return fallback(`openai-http-${response.status}`);
    }

    const responseData = (await response.json()) as OpenAIResponse;
    const outputText = extractOutputText(responseData);
    const parsed: unknown = outputText ? JSON.parse(outputText) : null;

    if (!isCuratorCopyContent(parsed)) {
      return fallback("invalid-structured-output");
    }

    logCurator("info", "final response", {
      requestId,
      hotspotId: hotspot.id,
      storyIndex: hotspot.storyIndex,
      source: "openai",
      openaiResponseId: responseData.id ?? "unavailable",
      model: responseData.model ?? CURATOR_MODEL,
    });

    return NextResponse.json({ ...parsed, source: "openai" });
  } catch (error) {
    logCurator("error", "OpenAI generation unavailable", {
      requestId,
      hotspotId: hotspot.id,
      storyIndex: hotspot.storyIndex,
      message: error instanceof Error ? error.message : "unknown error",
    });
    return fallback("openai-exception");
  }
}
