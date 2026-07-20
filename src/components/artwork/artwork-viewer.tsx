"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { AttentionTracker } from "@/components/artwork/attention-tracker";
import { CuriosityAnnotation } from "@/components/artwork/curiosity-annotation";
import { CuratorPanel } from "@/components/artwork/curator-panel";
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
};

function pointDistance(a: NormalizedPoint, b: NormalizedPoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function ArtworkViewer({ artwork }: { artwork: ArtworkMetadata }) {
  const [revealedNote, setRevealedNote] = useState<RevealedNote | null>(null);
  const [storyOpen, setStoryOpen] = useState(false);
  const [visitedHotspotIds, setVisitedHotspotIds] = useState<string[]>([]);

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
        visitedHotspotIds,
      };
      const copy = await generateCuratorCopy(payload, event.hotspot);

      setRevealedNote({ hotspot: event.hotspot, point: event.point, copy });
      setVisitedHotspotIds((current) =>
        current.includes(event.hotspot.id)
          ? current
          : [...current, event.hotspot.id],
      );
    },
    [artworkRequestMetadata, visitedHotspotIds],
  );

  const handlePointerActivity = useCallback((point: NormalizedPoint) => {
    setRevealedNote((current) => {
      if (!current || pointDistance(point, current.point) < 0.075) return current;
      return null;
    });
  }, []);

  const closeStory = () => {
    setStoryOpen(false);
    setRevealedNote(null);
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
                onOpen={() => setStoryOpen(true)}
              />
            ) : null}
          </AttentionTracker>
        </div>
      </section>

      <div className="viewer-footer page-enter page-enter-3" data-no-dwell>
        <p><span aria-hidden="true" /> Move slowly. Pause where your attention settles.</p>
        <p>{artwork.location}</p>
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
