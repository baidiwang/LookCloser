"use client";

import type { CuratorCopy } from "@/lib/curator-client";
import type { ViewportPoint } from "@/types/artwork";

type CuriosityAnnotationProps = {
  copy: CuratorCopy;
  point: ViewportPoint;
  hotspotLabel: string;
  isLoading: boolean;
  isLeaving: boolean;
  onHold: () => void;
  onOpen: () => void;
};

export function CuriosityAnnotation({
  copy,
  point,
  hotspotLabel,
  isLoading,
  isLeaving,
  onHold,
  onOpen,
}: CuriosityAnnotationProps) {
  const viewportWidth =
    typeof window === "undefined" ? 1280 : window.innerWidth;
  const viewportHeight =
    typeof window === "undefined" ? 720 : window.innerHeight;
  const annotationWidth = Math.min(
    450,
    viewportWidth <= 720 ? viewportWidth * 0.78 : viewportWidth * 0.4,
  );
  const horizontalGap = viewportWidth <= 720 ? 16 : 24;
  const viewportMargin = 16;
  const hasRoomRight =
    viewportWidth - point.x >= annotationWidth + horizontalGap + viewportMargin;
  const hasRoomLeft =
    point.x >= annotationWidth + horizontalGap + viewportMargin;
  const centered = !hasRoomRight && !hasRoomLeft;
  const alignRight = !centered && !hasRoomRight;
  const alignAbove = point.y > viewportHeight - 150;
  const position = {
    x: Math.min(viewportWidth - viewportMargin, Math.max(viewportMargin, point.x)),
    y: Math.min(viewportHeight - 72, Math.max(72, point.y)),
  };
  const positionClass = [
    "museum-annotation",
    alignRight ? "museum-annotation-right" : "",
    alignAbove ? "museum-annotation-above" : "",
    centered ? "museum-annotation-centered" : "",
    isLeaving ? "museum-annotation-leaving" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={positionClass}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onPointerEnter={onHold}
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
