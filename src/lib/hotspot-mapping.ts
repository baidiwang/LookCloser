import type { ArtworkHotspot, NormalizedPoint } from "@/types/artwork";

function containsPoint(hotspot: ArtworkHotspot, point: NormalizedPoint) {
  const { x, y, width, height } = hotspot.region;
  return (
    point.x >= x &&
    point.x <= x + width &&
    point.y >= y &&
    point.y <= y + height
  );
}

function normalizedDistanceToCenter(
  hotspot: ArtworkHotspot,
  point: NormalizedPoint,
) {
  const { x, y, width, height } = hotspot.region;
  const normalizedX = (point.x - (x + width / 2)) / (width / 2);
  const normalizedY = (point.y - (y + height / 2)) / (height / 2);
  return Math.hypot(normalizedX, normalizedY);
}

function hotspotArea(hotspot: ArtworkHotspot) {
  return hotspot.region.width * hotspot.region.height;
}

/**
 * Resolves overlapping regions deterministically. Relative distance is used so
 * a broad background hotspot cannot steal attention from a nearby figure.
 */
export function resolveHotspotAtPoint(
  hotspots: ArtworkHotspot[],
  point: NormalizedPoint,
) {
  return hotspots
    .filter((hotspot) => containsPoint(hotspot, point))
    .sort((a, b) => {
      const areaA = hotspotArea(a);
      const areaB = hotspotArea(b);
      const specificityRatio = Math.max(areaA, areaB) / Math.min(areaA, areaB);

      // When a figure sits inside a much broader scenic region, the smaller,
      // intentional figure region owns the overlap.
      if (specificityRatio >= 1.5) return areaA - areaB;

      const distanceDifference =
        normalizedDistanceToCenter(a, point) -
        normalizedDistanceToCenter(b, point);
      if (Math.abs(distanceDifference) > 0.0001) return distanceDifference;

      const areaDifference = areaA - areaB;
      if (Math.abs(areaDifference) > 0.0001) return areaDifference;

      return a.id.localeCompare(b.id);
    })[0];
}

export function findHotspotById(hotspots: ArtworkHotspot[], hotspotId: string) {
  return hotspots.find((hotspot) => hotspot.id === hotspotId);
}

export function validateHotspotMapping(hotspots: ArtworkHotspot[]) {
  const issues: string[] = [];
  const seenIds = new Set<string>();
  const seenBounds = new Set<string>();
  const seenStoryIndexes = new Set<string>();

  for (const hotspot of hotspots) {
    if (seenIds.has(hotspot.id)) issues.push(`duplicate id: ${hotspot.id}`);
    seenIds.add(hotspot.id);

    const boundsKey = [
      hotspot.region.x,
      hotspot.region.y,
      hotspot.region.width,
      hotspot.region.height,
    ].join(":");
    if (seenBounds.has(boundsKey)) {
      issues.push(`duplicate bounds: ${hotspot.id}`);
    }
    seenBounds.add(boundsKey);

    if (seenStoryIndexes.has(hotspot.storyIndex)) {
      issues.push(`duplicate story index: ${hotspot.storyIndex}`);
    }
    seenStoryIndexes.add(hotspot.storyIndex);
  }

  return issues;
}
