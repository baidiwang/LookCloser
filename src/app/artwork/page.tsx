import { ArtworkViewer } from "@/components/artwork/artwork-viewer";
import { lastSupperArtwork } from "@/data/last-supper";

export default function ArtworkPage() {
  return <ArtworkViewer artwork={lastSupperArtwork} />;
}
