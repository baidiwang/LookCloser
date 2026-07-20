"use client";

import type { CuratorCopy } from "@/lib/curator-client";
import type { NormalizedPoint } from "@/types/artwork";

type CuriosityAnnotationProps = {
  copy: CuratorCopy;
  point: NormalizedPoint;
  hotspotLabel: string;
  isLoading: boolean;
  onOpen: () => void;
};

export function CuriosityAnnotation({
  copy,
  point,
  hotspotLabel,
  isLoading,
  onOpen,
}: CuriosityAnnotationProps) {
  const alignRight = point.x > 0.62;

  return (
    <button
      type="button"
      className={`museum-annotation${alignRight ? " museum-annotation-right" : ""}`}
      style={{
        left: `${point.x * 100}%`,
        top: `${point.y * 100}%`,
      }}
      onClick={onOpen}
      data-no-dwell
      aria-busy={isLoading}
      aria-label={
        isLoading
          ? `Open the developing curator story about ${hotspotLabel}`
          : `Open curator story: ${copy.storyTitle}`
      }
    >
      <span className="annotation-marker" aria-hidden="true" />
      <span className="annotation-rule" aria-hidden="true" />
      <span className="annotation-copy">
        <strong>{copy.observationLine}</strong>
        <em>{copy.annotationText}</em>
        <small>
          {isLoading
            ? "The curator is looking · Enter the story"
            : `${hotspotLabel} · Enter the story`}
        </small>
      </span>
    </button>
  );
}
