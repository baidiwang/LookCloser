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
      <div className="story-text">
        {copy.storyParagraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
