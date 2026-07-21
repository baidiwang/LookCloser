"use client";

import {
  CSSProperties,
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
  PointerAttentionEvent,
} from "@/types/artwork";

const ATTENTION_TARGET_MS = 1700;
const RETURN_TARGET_MS = 1425;
const RETURN_WINDOW_MS = 14000;
const FOCUS_RANGE_PX = 64;

type PixelPoint = { x: number; y: number };

type AttentionTrace = {
  point: NormalizedPoint;
  progress: number;
};

type AttentionTrackerProps = {
  children: ReactNode;
  hotspots: ArtworkHotspot[];
  disabled?: boolean;
  onDwell: (event: AttentionEvent) => void;
  onPointerActivity?: (activity: PointerAttentionEvent | null) => void;
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

function attentionRate(speed: number) {
  if (speed <= 42) return 1.16;
  if (speed <= 120) return 0.88;
  if (speed <= 230) return 0.42;
  if (speed <= 360) return 0.12;
  return -0.5;
}

export function AttentionTracker({
  children,
  hotspots,
  disabled = false,
  onDwell,
  onPointerActivity,
}: AttentionTrackerProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const hotspotRef = useRef<ArtworkHotspot | null>(null);
  const focusCenterRef = useRef<PixelPoint | null>(null);
  const lastPointerRef = useRef<PixelPoint | null>(null);
  const attentionPointRef = useRef<NormalizedPoint | null>(null);
  const lastMoveTimeRef = useRef(0);
  const trackingStartedRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const attentionMsRef = useRef(0);
  const attentionTargetRef = useRef(ATTENTION_TARGET_MS);
  const speedRef = useRef(0);
  const triggeredRef = useRef<string | null>(null);
  const lastTriggeredAtRef = useRef<Map<string, number>>(new Map());
  const lastTraceUpdateRef = useRef(0);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const [trace, setTrace] = useState<AttentionTrace | null>(null);

  const hideCursor = () => {
    if (cursorRef.current) cursorRef.current.style.opacity = "0";
  };

  const reset = useCallback((clearTriggered = true) => {
    hotspotRef.current = null;
    focusCenterRef.current = null;
    lastPointerRef.current = null;
    attentionPointRef.current = null;
    attentionMsRef.current = 0;
    speedRef.current = 0;
    lastFrameTimeRef.current = 0;
    setTrace(null);
    if (clearTriggered) triggeredRef.current = null;
  }, []);

  const beginAttention = (
    pixelPoint: PixelPoint,
    point: NormalizedPoint,
    hotspot: ArtworkHotspot,
    now: number,
  ) => {
    const lastTrigger = lastTriggeredAtRef.current.get(hotspot.id) ?? 0;
    const isRecentReturn = now - lastTrigger < RETURN_WINDOW_MS;

    hotspotRef.current = hotspot;
    focusCenterRef.current = pixelPoint;
    lastPointerRef.current = pixelPoint;
    attentionPointRef.current = point;
    lastMoveTimeRef.current = now;
    trackingStartedRef.current = now;
    lastFrameTimeRef.current = now;
    attentionMsRef.current = isRecentReturn ? 180 : 0;
    attentionTargetRef.current = isRecentReturn
      ? RETURN_TARGET_MS
      : ATTENTION_TARGET_MS;
    speedRef.current = 0;
    triggeredRef.current = null;
    setTrace({ point, progress: attentionMsRef.current / attentionTargetRef.current });
  };

  useEffect(() => {
    let animationFrame = 0;

    const readAttention = (now: number) => {
      const hotspot = hotspotRef.current;
      const point = attentionPointRef.current;

      if (hotspot && point && triggeredRef.current !== hotspot.id && !disabled) {
        const previousFrame = lastFrameTimeRef.current || now;
        const frameTime = Math.min(Math.max(now - previousFrame, 0), 80);
        lastFrameTimeRef.current = now;

        const idleTime = now - lastMoveTimeRef.current;
        const idleDecay = Math.max(0, 1 - idleTime / 260);
        const effectiveSpeed = speedRef.current * idleDecay;
        const focusCenter = focusCenterRef.current;
        const lastPointer = lastPointerRef.current;
        const withinFocusRange =
          !focusCenter ||
          !lastPointer ||
          pixelDistance(focusCenter, lastPointer) <= FOCUS_RANGE_PX;
        const rangeFactor = withinFocusRange ? 1 : 0.35;
        const rate = attentionRate(effectiveSpeed) * rangeFactor;

        attentionMsRef.current = Math.min(
          attentionTargetRef.current,
          Math.max(0, attentionMsRef.current + frameTime * rate),
        );

        const progress = attentionMsRef.current / attentionTargetRef.current;
        if (now - lastTraceUpdateRef.current > 32) {
          setTrace({ point, progress });
          lastTraceUpdateRef.current = now;
        }

        if (progress >= 1) {
          const dwellTimeMs = Math.round(now - trackingStartedRef.current);
          triggeredRef.current = hotspot.id;
          lastTriggeredAtRef.current.set(hotspot.id, now);
          hotspotRef.current = null;
          setTrace(null);
          onDwell({
            hotspot,
            point,
            viewportPoint: lastPointerRef.current ?? { x: 0, y: 0 },
            dwellTimeMs,
          });
        }
      }

      animationFrame = requestAnimationFrame(readAttention);
    };

    animationFrame = requestAnimationFrame(readAttention);
    return () => cancelAnimationFrame(animationFrame);
  }, [disabled, onDwell]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || event.pointerType === "touch") return;

    const target = event.target as HTMLElement;
    if (target.closest("[data-no-dwell]")) {
      reset(false);
      hideCursor();
      return;
    }

    const rect = surfaceRef.current?.getBoundingClientRect();
    if (!rect) return;

    const pixelPoint = { x: event.clientX, y: event.clientY };
    const point = {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    };
    if (cursorRef.current) {
      cursorRef.current.style.left = `${point.x * 100}%`;
      cursorRef.current.style.top = `${point.y * 100}%`;
      cursorRef.current.style.opacity = "1";
    }

    const hotspot = findHotspot(hotspots, point);
    onPointerActivity?.({
      point,
      viewportPoint: pixelPoint,
      hotspot: hotspot ?? null,
    });
    if (!hotspot) {
      reset();
      return;
    }

    if (triggeredRef.current === hotspot.id) return;

    const now = performance.now();
    if (hotspotRef.current?.id !== hotspot.id) {
      beginAttention(pixelPoint, point, hotspot, now);
      return;
    }

    const lastPointer = lastPointerRef.current;
    const elapsed = Math.max(now - lastMoveTimeRef.current, 1);
    if (lastPointer) {
      const instantSpeed = (pixelDistance(pixelPoint, lastPointer) / elapsed) * 1000;
      speedRef.current = speedRef.current * 0.56 + instantSpeed * 0.44;
    }

    const focusCenter = focusCenterRef.current;
    if (focusCenter) {
      if (pixelDistance(pixelPoint, focusCenter) > FOCUS_RANGE_PX) {
        attentionMsRef.current = Math.max(0, attentionMsRef.current - 110);
        focusCenterRef.current = pixelPoint;
      } else {
        focusCenterRef.current = {
          x: focusCenter.x * 0.92 + pixelPoint.x * 0.08,
          y: focusCenter.y * 0.92 + pixelPoint.y * 0.08,
        };
      }
    }

    lastPointerRef.current = pixelPoint;
    attentionPointRef.current = point;
    lastMoveTimeRef.current = now;
  };

  const progressStyle = trace
    ? ({
        left: `${trace.point.x * 100}%`,
        top: `${trace.point.y * 100}%`,
        "--attention-progress": trace.progress,
      } as CSSProperties)
    : undefined;

  return (
    <div
      ref={surfaceRef}
      className="attention-surface"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        reset();
        hideCursor();
        onPointerActivity?.(null);
      }}
    >
      {children}
      <span
        ref={cursorRef}
        className={`attention-cursor${disabled ? " attention-cursor-hidden" : ""}`}
        aria-hidden="true"
      />
      {trace && trace.progress > 0.08 ? (
        <span
          className="attention-progress"
          style={progressStyle}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
