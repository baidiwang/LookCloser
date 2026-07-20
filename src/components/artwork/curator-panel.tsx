"use client";

import type { ArtworkHotspot } from "@/types/artwork";
import type { CuratorCopy } from "@/lib/curator-client";
import { StoryPanel } from "@/components/artwork/story-panel";

export function CuratorPanel({
  hotspot,
  copy,
  onClose,
}: {
  hotspot: ArtworkHotspot;
  copy: CuratorCopy;
  onClose: () => void;
}) {
  return (
    <aside className="curator-panel" data-no-dwell aria-label="Curator note">
      <div className="curator-panel-topline">
        <p>Look Closer · Curator&apos;s note</p>
        <button type="button" onClick={onClose} aria-label="Close curator note">
          <span aria-hidden="true" />
          Close
        </button>
      </div>
      <StoryPanel hotspot={hotspot} copy={copy} />
      <footer className="curator-panel-footer">
        <p>Let another detail hold your attention.</p>
        <button type="button" onClick={onClose}>
          {copy.ctaLabel}
          <span aria-hidden="true" />
        </button>
      </footer>
    </aside>
  );
}
