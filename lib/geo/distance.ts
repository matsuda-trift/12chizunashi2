import type { GeoPoint } from "./types";

const EARTH_RADIUS_METERS = 6378137;

export function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function calculateHaversineDistance(
  a: GeoPoint,
  b: GeoPoint,
): number {
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const deltaLat = lat2 - lat1;
  const deltaLon = toRadians(b.longitude - a.longitude);

  const sinLat = Math.sin(deltaLat / 2);
  const sinLon = Math.sin(deltaLon / 2);

  const h =
    sinLat * sinLat +
    Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;

  const centralAngle = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_METERS * centralAngle;
}

export function isArrived({
  distanceMeters,
  accuracyMeters,
}: {
  distanceMeters: number | null;
  accuracyMeters: number | null;
}) {
  if (distanceMeters === null) {
    return false;
  }
  const threshold =
    accuracyMeters === null
      ? 10
      : Math.max(10, Math.ceil(accuracyMeters * 1.2));
  return distanceMeters <= threshold;
}
