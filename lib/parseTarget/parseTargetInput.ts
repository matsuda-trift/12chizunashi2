import type { GeoPoint } from "../geo/types";

export type ParsedTarget =
  | { kind: "coordinates"; coordinates: GeoPoint }
  | { kind: "place"; keyword: string }
  | { kind: "link"; url: string }
  | { kind: "unknown"; raw: string };

const COORDINATE_PATTERN =
  /^\s*(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/;

export function parseTargetInput(input: string): ParsedTarget {
  const trimmed = input.trim();
  if (!trimmed) {
    return { kind: "unknown", raw: input };
  }

  const coordinateMatch = trimmed.match(COORDINATE_PATTERN);
  if (coordinateMatch) {
    const latitude = Number.parseFloat(coordinateMatch[1] ?? "");
    const longitude = Number.parseFloat(coordinateMatch[2] ?? "");
    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    ) {
      return {
        kind: "coordinates",
        coordinates: { latitude, longitude },
      };
    }
  }

  if (trimmed.startsWith("https://maps.app.goo.gl/")) {
    return { kind: "link", url: trimmed };
  }

  return { kind: "place", keyword: trimmed };
}
