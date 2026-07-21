"use client";

import type { CuratorCopy } from "@/lib/curator-client";
import type {
  AnnotationAnchorDirection,
  AnnotationPlacement,
  ViewportPoint,
} from "@/types/artwork";

type CuriosityAnnotationProps = {
  copy: CuratorCopy;
  point: ViewportPoint;
  hotspotLabel: string;
  placement?: AnnotationPlacement;
  isLoading: boolean;
  isLeaving: boolean;
  onHold: () => void;
  onOpen: () => void;
};

export function CuriosityAnnotation({
  copy,
  point,
  hotspotLabel,
  placement,
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
  const annotationHeight = viewportWidth <= 720 ? 196 : 178;
  const gap = viewportWidth <= 720 ? 18 : 26;
  const viewportMargin = 16;
  const offset = placement?.offset ?? { x: 0, y: 0 };
  const attentionPoint = {
    x: point.x + offset.x,
    y: point.y + offset.y,
  };
  const room: Record<AnnotationAnchorDirection, boolean> = {
    right:
      viewportWidth - attentionPoint.x >= annotationWidth + gap + viewportMargin,
    left: attentionPoint.x >= annotationWidth + gap + viewportMargin,
    top: attentionPoint.y >= annotationHeight + gap + viewportMargin,
    bottom:
      viewportHeight - attentionPoint.y >=
      annotationHeight + gap + viewportMargin,
  };
  const opposite: Record<AnnotationAnchorDirection, AnnotationAnchorDirection> = {
    right: "left",
    left: "right",
    top: "bottom",
    bottom: "top",
  };
  const preferredDirection = placement?.direction ?? "right";
  const fallbackOrder: AnnotationAnchorDirection[] = [
    preferredDirection,
    opposite[preferredDirection],
    attentionPoint.y < viewportHeight / 2 ? "bottom" : "top",
    attentionPoint.x < viewportWidth / 2 ? "right" : "left",
  ];
  const direction =
    fallbackOrder.find((candidate) => room[candidate]) ??
    (attentionPoint.y < viewportHeight / 2 ? "bottom" : "top");
  const isVertical = direction === "top" || direction === "bottom";
  const position = {
    x: isVertical
      ? Math.min(
          viewportWidth - annotationWidth / 2 - viewportMargin,
          Math.max(annotationWidth / 2 + viewportMargin, attentionPoint.x),
        )
      : Math.min(
          viewportWidth - viewportMargin,
          Math.max(viewportMargin, attentionPoint.x),
        ),
    y: isVertical
      ? Math.min(
          viewportHeight - viewportMargin,
          Math.max(viewportMargin, attentionPoint.y),
        )
      : Math.min(
          viewportHeight - annotationHeight / 2 - viewportMargin,
          Math.max(annotationHeight / 2 + viewportMargin, attentionPoint.y),
        ),
  };
  const positionClass = [
    "museum-annotation",
    `museum-annotation-anchor-${direction}`,
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
      data-anchor-direction={direction}
      aria-busy={isLoading}
      aria-label={`Open curator story about ${hotspotLabel}`}
    >
      <span className="annotation-marker" aria-hidden="true" />
      <span className="annotation-rule" aria-hidden="true" />
      <span className="annotation-copy">
        <strong>{copy.annotation}</strong>
        <em>{copy.subtitle}</em>
        <small>{hotspotLabel} · Enter the story</small>
      </span>
    </button>
  );
}
