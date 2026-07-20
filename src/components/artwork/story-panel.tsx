import type { ArtworkHotspot } from "@/types/artwork";
import type { CuratorCopy } from "@/lib/curator-client";

export function StoryPanel({
  hotspot,
  copy,
}: {
  hotspot: ArtworkHotspot;
  copy: CuratorCopy;
}) {
  return (
    <article className="story-panel">
      <p className="story-index">Observation {hotspot.storyIndex}</p>
      <h2>{copy.storyTitle}</h2>
      <div className="story-divider" aria-hidden="true">
        <span />
      </div>
      <p className="story-text">{copy.storyText}</p>
    </article>
  );
}
