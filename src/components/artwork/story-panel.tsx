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
    <section className="story-panel">
      <div className="story-intro">
        <p className="story-index">Curator observation {hotspot.storyIndex}</p>
        <p className="story-attention-line">{copy.observationLine}</p>
        <h2>{copy.storyTitle}</h2>
      </div>

      <div className="curator-sections">
        <section className="curator-section">
          <p className="curator-section-label"><span>01</span> Observation</p>
          <p>{copy.annotationText}</p>
        </section>
        <section className="curator-section">
          <p className="curator-section-label"><span>02</span> Why this matters</p>
          <p>{copy.whyItMatters}</p>
        </section>
        <section className="curator-section curator-section-next">
          <p className="curator-section-label"><span>03</span> What to notice next</p>
          <p>{copy.noticeNext}</p>
        </section>
      </div>
    </section>
  );
}
