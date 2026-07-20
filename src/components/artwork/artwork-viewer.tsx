"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
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
} from "@/types/artwork";

type RevealedNote = {
  hotspot: ArtworkHotspot;
  point: NormalizedPoint;
  copy: CuratorCopy;
  isLoading: boolean;
};

function pointDistance(a: NormalizedPoint, b: NormalizedPoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function ArtworkViewer({ artwork }: { artwork: ArtworkMetadata }) {
  const [revealedNote, setRevealedNote] = useState<RevealedNote | null>(null);
  const [storyOpen, setStoryOpen] = useState(false);
  const [visitedHotspotIds, setVisitedHotspotIds] = useState<string[]>([]);
  const activeRequestRef = useRef(0);
  const revealedNoteRef = useRef<RevealedNote | null>(null);
  const visitedHotspotIdsRef = useRef<string[]>([]);
  const priorCuriosityNotesRef = useRef<string[]>([]);

  const updateRevealedNote = useCallback((note: RevealedNote | null) => {
    revealedNoteRef.current = note;
    setRevealedNote(note);
  }, []);

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

  const handleDwell = useCallback(
    async (event: AttentionEvent) => {
      const payload: CuratorGenerationInput = {
        artwork: artworkRequestMetadata,
        hotspotId: event.hotspot.id,
        dwellTimeMs: event.dwellTimeMs,
        visitedHotspotIds: visitedHotspotIdsRef.current,
        priorCuriosityNotes: priorCuriosityNotesRef.current,
      };

      const requestId = ++activeRequestRef.current;
      const fallbackCopy = createFallbackCuratorCopy(payload, event.hotspot);

      updateRevealedNote({
        hotspot: event.hotspot,
        point: event.point,
        copy: fallbackCopy,
        isLoading: true,
      });

      const nextVisitedHotspotIds = visitedHotspotIdsRef.current.includes(
        event.hotspot.id,
      )
        ? visitedHotspotIdsRef.current
        : [...visitedHotspotIdsRef.current, event.hotspot.id];
      visitedHotspotIdsRef.current = nextVisitedHotspotIds;
      setVisitedHotspotIds(nextVisitedHotspotIds);

      const copy = await generateCuratorCopy(payload, event.hotspot);
      if (requestId !== activeRequestRef.current) return;

      updateRevealedNote({
        hotspot: event.hotspot,
        point: event.point,
        copy,
        isLoading: false,
      });

      const note = `${copy.observationLine} ${copy.annotationText}`;
      priorCuriosityNotesRef.current = [
        ...priorCuriosityNotesRef.current,
        note,
      ].slice(-6);
    },
    [artworkRequestMetadata, updateRevealedNote],
  );

  const handlePointerActivity = useCallback((point: NormalizedPoint) => {
    const current = revealedNoteRef.current;
    if (!current || pointDistance(point, current.point) < 0.075) return;

    activeRequestRef.current += 1;
    updateRevealedNote(null);
  }, [updateRevealedNote]);

  const closeStory = () => {
    setStoryOpen(false);
    activeRequestRef.current += 1;
    updateRevealedNote(null);
  };

  return (
    <main className="immersive-viewer">
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
        <div className="artwork-frame">
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
            {revealedNote && !storyOpen ? (
              <CuriosityAnnotation
                copy={revealedNote.copy}
                point={revealedNote.point}
                hotspotLabel={revealedNote.hotspot.label}
                isLoading={revealedNote.isLoading}
                onOpen={() => setStoryOpen(true)}
              />
            ) : null}
          </AttentionTracker>
        </div>
      </section>

      <div className="viewer-footer page-enter page-enter-3" data-no-dwell>
        <p><span aria-hidden="true" /> Move slowly. Pause where your attention settles.</p>
        <p>{String(visitedHotspotIds.length).padStart(2, "0")} / {String(artwork.hotspots.length).padStart(2, "0")} observed</p>
      </div>

      {storyOpen && revealedNote ? (
        <CuratorPanel
          hotspot={revealedNote.hotspot}
          copy={revealedNote.copy}
          onClose={closeStory}
        />
      ) : null}
    </main>
  );
}
