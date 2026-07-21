"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AttentionTracker } from "@/components/artwork/attention-tracker";
import { CuriosityAnnotation } from "@/components/artwork/curiosity-annotation";
import { CuratorPanel } from "@/components/artwork/curator-panel";
import { createFallbackCuratorCopy } from "@/lib/curator-fallback";
import {
  generateCuratorCopy,
  type CuratorCopy,
  type CuratorGenerationInput,
} from "@/lib/curator-client";
import type {
  ArtworkHotspot,
  ArtworkMetadata,
  AttentionEvent,
  NormalizedPoint,
  PointerAttentionEvent,
  ViewportPoint,
} from "@/types/artwork";

type RevealedNote = {
  hotspot: ArtworkHotspot;
  viewportPoint: ViewportPoint;
  /** Frozen at reveal time so an async curator response never rewrites a note mid-read. */
  annotationCopy: CuratorCopy;
  copy: CuratorCopy;
  isLoading: boolean;
  isLeaving: boolean;
};

type LockedStory = {
  hotspot: ArtworkHotspot;
  copy: CuratorCopy;
};

function hotspotContainsPoint(
  hotspot: ArtworkHotspot,
  point: NormalizedPoint,
) {
  const { x, y, width, height } = hotspot.region;
  return (
    point.x >= x &&
    point.x <= x + width &&
    point.y >= y &&
    point.y <= y + height
  );
}

export function ArtworkViewer({ artwork }: { artwork: ArtworkMetadata }) {
  const [revealedNote, setRevealedNote] = useState<RevealedNote | null>(null);
  const [storyOpen, setStoryOpen] = useState(false);
  const [lockedStory, setLockedStory] = useState<LockedStory | null>(null);
  const [visitedHotspotIds, setVisitedHotspotIds] = useState<string[]>([]);
  const storyOpenRef = useRef(false);
  const activeRequestRef = useRef(0);
  const revealedNoteRef = useRef<RevealedNote | null>(null);
  const visitedHotspotIdsRef = useRef<string[]>([]);
  const hotspotVisitCountsRef = useRef<Record<string, number>>({});
  const priorCuriosityNotesRef = useRef<string[]>([]);
  const annotationLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const annotationFadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const updateRevealedNote = useCallback((note: RevealedNote | null) => {
    revealedNoteRef.current = note;
    setRevealedNote(note);
  }, []);

  const cancelAnnotationExit = useCallback(() => {
    if (annotationLeaveTimerRef.current) {
      clearTimeout(annotationLeaveTimerRef.current);
      annotationLeaveTimerRef.current = null;
    }
    if (annotationFadeTimerRef.current) {
      clearTimeout(annotationFadeTimerRef.current);
      annotationFadeTimerRef.current = null;
    }
  }, []);

  const scheduleAnnotationExit = useCallback(() => {
    if (
      annotationLeaveTimerRef.current ||
      annotationFadeTimerRef.current ||
      !revealedNoteRef.current
    ) {
      return;
    }

    annotationLeaveTimerRef.current = setTimeout(() => {
      annotationLeaveTimerRef.current = null;
      if (storyOpenRef.current) return;
      const current = revealedNoteRef.current;
      if (!current) return;

      updateRevealedNote({ ...current, isLeaving: true });
      annotationFadeTimerRef.current = setTimeout(() => {
        annotationFadeTimerRef.current = null;
        if (storyOpenRef.current) return;
        activeRequestRef.current += 1;
        updateRevealedNote(null);
      }, 360);
    }, 260);
  }, [updateRevealedNote]);

  useEffect(
    () => () => {
      if (annotationLeaveTimerRef.current) {
        clearTimeout(annotationLeaveTimerRef.current);
      }
      if (annotationFadeTimerRef.current) {
        clearTimeout(annotationFadeTimerRef.current);
      }
    },
    [],
  );

  const artworkRequestMetadata = useMemo(
    () => ({
      id: artwork.id,
      title: artwork.title,
      artist: artwork.artist,
      date: artwork.date,
      location: artwork.location,
    }),
    [artwork],
  );

  const storyFocusShift = useMemo(() => {
    if (!storyOpen || !lockedStory) return 0;
    const regionCenter =
      lockedStory.hotspot.region.x + lockedStory.hotspot.region.width / 2;
    const desiredShift = (0.44 - regionCenter) * 100;

    // Preserve enough artwork beneath the insert to avoid exposing a dark seam.
    return Math.min(4.5, Math.max(-11, desiredShift));
  }, [lockedStory, storyOpen]);

  const handleDwell = useCallback(
    async (event: AttentionEvent) => {
      if (storyOpenRef.current) return;

      const payload: CuratorGenerationInput = {
        artwork: artworkRequestMetadata,
        hotspotId: event.hotspot.id,
        hotspotLabel: event.hotspot.label,
        hotspotVisitCount:
          (hotspotVisitCountsRef.current[event.hotspot.id] ?? 0) + 1,
        dwellTimeMs: event.dwellTimeMs,
        visitedHotspotIds: visitedHotspotIdsRef.current,
        priorCuriosityNotes: priorCuriosityNotesRef.current,
        interactionStage: "attention-reveal",
      };

      if (process.env.NODE_ENV === "development") {
        console.info("[Look Closer][attention] hotspot selected", {
          hotspotId: event.hotspot.id,
          hotspotLabel: event.hotspot.label,
          storyIndex: event.hotspot.storyIndex,
          dwellTimeMs: event.dwellTimeMs,
        });
      }

      cancelAnnotationExit();
      const requestId = ++activeRequestRef.current;
      const fallbackCopy = createFallbackCuratorCopy(payload, event.hotspot);

      updateRevealedNote({
        hotspot: event.hotspot,
        viewportPoint: event.viewportPoint,
        annotationCopy: fallbackCopy,
        copy: fallbackCopy,
        isLoading: true,
        isLeaving: false,
      });

      const nextVisitedHotspotIds = visitedHotspotIdsRef.current.includes(
        event.hotspot.id,
      )
        ? visitedHotspotIdsRef.current
        : [...visitedHotspotIdsRef.current, event.hotspot.id];
      visitedHotspotIdsRef.current = nextVisitedHotspotIds;
      setVisitedHotspotIds(nextVisitedHotspotIds);
      hotspotVisitCountsRef.current = {
        ...hotspotVisitCountsRef.current,
        [event.hotspot.id]: payload.hotspotVisitCount,
      };

      const copy = await generateCuratorCopy(payload, event.hotspot);
      if (requestId !== activeRequestRef.current) return;

      if (process.env.NODE_ENV === "development") {
        console.info("[Look Closer][curator] copy received", {
          hotspotId: event.hotspot.id,
          storyIndex: event.hotspot.storyIndex,
          source: copy.source,
        });
      }

      const currentNote = revealedNoteRef.current;
      const isCurrentHotspot = currentNote?.hotspot.id === event.hotspot.id;
      const currentViewportPoint = isCurrentHotspot
        ? currentNote.viewportPoint
        : event.viewportPoint;
      const annotationCopy = isCurrentHotspot
        ? currentNote.annotationCopy
        : fallbackCopy;

      updateRevealedNote({
        hotspot: event.hotspot,
        viewportPoint: currentViewportPoint,
        annotationCopy,
        copy,
        isLoading: false,
        isLeaving: false,
      });

      const note = `${annotationCopy.annotation} ${annotationCopy.subtitle}`;
      priorCuriosityNotesRef.current = [
        ...priorCuriosityNotesRef.current,
        note,
      ].slice(-6);
    },
    [artworkRequestMetadata, cancelAnnotationExit, updateRevealedNote],
  );

  const handlePointerActivity = useCallback(
    (activity: PointerAttentionEvent | null) => {
      if (storyOpenRef.current) return;

      const current = revealedNoteRef.current;
      if (!current) return;

      if (!activity || !hotspotContainsPoint(current.hotspot, activity.point)) {
        scheduleAnnotationExit();
        return;
      }

      cancelAnnotationExit();
      const moved = Math.hypot(
        activity.viewportPoint.x - current.viewportPoint.x,
        activity.viewportPoint.y - current.viewportPoint.y,
      );
      if (moved > 1 || current.isLeaving) {
        updateRevealedNote({
          ...current,
          viewportPoint: activity.viewportPoint,
          isLeaving: false,
        });
      }
    },
    [cancelAnnotationExit, scheduleAnnotationExit, updateRevealedNote],
  );

  const holdAnnotation = useCallback(() => {
    cancelAnnotationExit();
    const current = revealedNoteRef.current;
    if (current?.isLeaving) {
      updateRevealedNote({ ...current, isLeaving: false });
    }
  }, [cancelAnnotationExit, updateRevealedNote]);

  const openStory = useCallback(() => {
    const current = revealedNoteRef.current;
    if (!current || storyOpenRef.current) return;

    cancelAnnotationExit();
    storyOpenRef.current = true;
    setLockedStory({
      hotspot: current.hotspot,
      copy: current.copy,
    });

    if (process.env.NODE_ENV === "development") {
      console.info("[Look Closer][story] bookmark opened", {
        hotspotId: current.hotspot.id,
        storyIndex: current.hotspot.storyIndex,
        source: current.copy.source,
      });
    }
    setStoryOpen(true);
  }, [cancelAnnotationExit]);

  const closeStory = () => {
    cancelAnnotationExit();
    storyOpenRef.current = false;
    setStoryOpen(false);
    setLockedStory(null);
    activeRequestRef.current += 1;
    updateRevealedNote(null);
  };

  return (
    <main className={`immersive-viewer${storyOpen ? " story-is-open" : ""}`}>
      <div className="viewer-ambient" aria-hidden="true">
        <Image src={artwork.imageSrc} alt="" fill priority sizes="100vw" />
      </div>
      <div className="viewer-wash" aria-hidden="true" />
      <div className="film-grain" aria-hidden="true" />

      <header className="viewer-header page-enter page-enter-1" data-no-dwell>
        <Link className="viewer-return" href="/">
          <span aria-hidden="true" />
          Return
        </Link>
        <div className="viewer-title">
          <h1>{artwork.title}</h1>
          <p>{artwork.artist} · {artwork.date}</p>
        </div>
        <p className="viewer-brand">Look Closer</p>
      </header>

      <section className="artwork-stage page-enter page-enter-2" aria-label={`${artwork.title} immersive viewer`}>
        <div
          className="artwork-frame"
          style={{ transform: `translateX(${storyFocusShift}%)` }}
        >
          <AttentionTracker
            hotspots={artwork.hotspots}
            onDwell={handleDwell}
            onPointerActivity={handlePointerActivity}
            disabled={storyOpen}
          >
            <Image
              className="artwork-image"
              src={artwork.imageSrc}
              alt={artwork.imageAlt}
              fill
              priority
              sizes="100vw"
            />
            <div className="artwork-surface-vignette" aria-hidden="true" />
            {storyOpen && lockedStory ? (
              <>
                <div className="artwork-story-veil" aria-hidden="true" />
                <div
                  className="story-focus-glow"
                  style={{
                    left: `${lockedStory.hotspot.region.x * 100}%`,
                    top: `${lockedStory.hotspot.region.y * 100}%`,
                    width: `${lockedStory.hotspot.region.width * 100}%`,
                    height: `${lockedStory.hotspot.region.height * 100}%`,
                  }}
                  aria-hidden="true"
                />
              </>
            ) : null}
          </AttentionTracker>
        </div>
      </section>

      {revealedNote && !storyOpen ? (
        <CuriosityAnnotation
          copy={revealedNote.annotationCopy}
          point={revealedNote.viewportPoint}
          hotspotLabel={revealedNote.hotspot.label}
          placement={revealedNote.hotspot.annotationPlacement}
          isLoading={revealedNote.isLoading}
          isLeaving={revealedNote.isLeaving}
          onHold={holdAnnotation}
          onOpen={openStory}
        />
      ) : null}

      <div className="viewer-footer page-enter page-enter-3" data-no-dwell>
        <p><span aria-hidden="true" /> Move gently. Let your attention wander.</p>
        <p>{String(visitedHotspotIds.length).padStart(2, "0")} / {String(artwork.hotspots.length).padStart(2, "0")} observed</p>
      </div>

      {storyOpen && lockedStory ? (
        <CuratorPanel
          hotspot={lockedStory.hotspot}
          copy={lockedStory.copy}
          onClose={closeStory}
        />
      ) : null}
    </main>
  );
}
