"use client";

import {
  PointerEvent as ReactPointerEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  ArtworkHotspot,
  AttentionEvent,
  NormalizedPoint,
} from "@/types/artwork";

const DWELL_DELAY_MS = 2500;
const DWELL_RADIUS_PX = 18;

type PixelPoint = { x: number; y: number };

type AttentionTrackerProps = {
  children: ReactNode;
  hotspots: ArtworkHotspot[];
  disabled?: boolean;
  onDwell: (event: AttentionEvent) => void;
  onPointerActivity?: (point: NormalizedPoint) => void;
};

function pixelDistance(a: PixelPoint, b: PixelPoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function contains(hotspot: ArtworkHotspot, point: NormalizedPoint) {
  const { x, y, width, height } = hotspot.region;
  return (
    point.x >= x &&
    point.x <= x + width &&
    point.y >= y &&
    point.y <= y + height
  );
}

function distanceToRegionCenter(hotspot: ArtworkHotspot, point: NormalizedPoint) {
  const centerX = hotspot.region.x + hotspot.region.width / 2;
  const centerY = hotspot.region.y + hotspot.region.height / 2;
  return Math.hypot(point.x - centerX, point.y - centerY);
}

function findHotspot(hotspots: ArtworkHotspot[], point: NormalizedPoint) {
  return hotspots
    .filter((hotspot) => contains(hotspot, point))
    .sort(
      (a, b) =>
        distanceToRegionCenter(a, point) - distanceToRegionCenter(b, point),
    )[0];
}

export function AttentionTracker({
  children,
  hotspots,
  disabled = false,
  onDwell,
  onPointerActivity,
}: AttentionTrackerProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<PixelPoint | null>(null);
  const hotspotRef = useRef<ArtworkHotspot | null>(null);
  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggeredRef = useRef<string | null>(null);
  const [trace, setTrace] = useState<NormalizedPoint | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setTrace(null);
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    anchorRef.current = null;
    hotspotRef.current = null;
    triggeredRef.current = null;
  }, [clearTimer]);

  useEffect(() => reset, [reset]);

  const beginDwell = useCallback(
    (pixelPoint: PixelPoint, point: NormalizedPoint, hotspot: ArtworkHotspot) => {
      clearTimer();
      anchorRef.current = pixelPoint;
      hotspotRef.current = hotspot;
      startTimeRef.current = performance.now();
      setTrace(point);

      timerRef.current = setTimeout(() => {
        const dwellTimeMs = Math.round(performance.now() - startTimeRef.current);
        triggeredRef.current = hotspot.id;
        setTrace(null);
        timerRef.current = null;
        onDwell({ hotspot, point, dwellTimeMs });
      }, DWELL_DELAY_MS);
    },
    [clearTimer, onDwell],
  );

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || event.pointerType === "touch") return;

    const target = event.target as HTMLElement;
    if (target.closest("[data-no-dwell]")) {
      reset();
      return;
    }

    const rect = surfaceRef.current?.getBoundingClientRect();
    if (!rect) return;

    const pixelPoint = { x: event.clientX, y: event.clientY };
    const point = {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
    onPointerActivity?.(point);

    const hotspot = findHotspot(hotspots, point);
    if (!hotspot) {
      reset();
      return;
    }

    if (triggeredRef.current === hotspot.id) return;

    const changedHotspot = hotspotRef.current?.id !== hotspot.id;
    const movedBeyondRadius =
      !anchorRef.current ||
      pixelDistance(pixelPoint, anchorRef.current) > DWELL_RADIUS_PX;

    if (changedHotspot || movedBeyondRadius) {
      beginDwell(pixelPoint, point, hotspot);
    }
  };

  return (
    <div
      ref={surfaceRef}
      className="attention-surface"
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
    >
      {children}
      {trace ? (
        <span
          key={`${trace.x}-${trace.y}`}
          className="attention-progress"
          style={{ left: `${trace.x * 100}%`, top: `${trace.y * 100}%` }}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
