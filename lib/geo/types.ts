export type GeoPoint = {
  latitude: number;
  longitude: number;
};

export type PlaceSuggestion = {
  id: string;
  primaryText: string;
  secondaryText?: string;
  location: GeoPoint | null;
  distanceMeters?: number;
};
