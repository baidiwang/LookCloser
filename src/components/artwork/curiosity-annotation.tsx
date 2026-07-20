"use client";

import type { CuratorCopy } from "@/lib/curator-client";
import type { NormalizedPoint } from "@/types/artwork";

type CuriosityAnnotationProps = {
  copy: CuratorCopy;
  point: NormalizedPoint;
  onOpen: () => void;
};

export function CuriosityAnnotation({
  copy,
  point,
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
      aria-label={`Open curator story: ${copy.label}`}
    >
      <span className="annotation-marker" aria-hidden="true" />
      <span className="annotation-rule" aria-hidden="true" />
      <span className="annotation-copy">
        <span>{copy.label}</span>
        <strong>{copy.curiosityLine}</strong>
        <small>Read the curator&apos;s note</small>
      </span>
    </button>
  );
}
