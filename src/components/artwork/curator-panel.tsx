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
    <aside
      className="curator-panel"
      data-no-dwell
      data-hotspot-id={hotspot.id}
      data-story-index={hotspot.storyIndex}
      data-copy-source={copy.source}
      aria-label="Curator observation"
    >
      <div className="curator-bookmark-tab" aria-hidden="true">
        <span>{hotspot.storyIndex}</span>
      </div>
      <div className="curator-panel-topline">
        <p>Look Closer · Revealed from the painting</p>
        <button type="button" onClick={onClose} aria-label="Return to the painting">
          <span aria-hidden="true" />
          Continue looking
        </button>
      </div>
      <StoryPanel hotspot={hotspot} copy={copy} />
      <footer className="curator-panel-footer">
        <p>The painting is still waiting. Let another detail hold your attention.</p>
        <button type="button" onClick={onClose}>
          {copy.cta}
          <span aria-hidden="true" />
        </button>
      </footer>
    </aside>
  );
}
