"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GeoPoint, PlaceSuggestion } from "./types";

type FetchState = "idle" | "loading" | "error";

type PlacesSearchState = {
  queryValue: string;
  setQueryValue: (value: string) => void;
  suggestions: PlaceSuggestion[];
  isLoading: boolean;
  activeTarget: PlaceSuggestion | null;
  selectSuggestion: (suggestion: PlaceSuggestion) => void;
};

type UsePlacesSearchArgs = {
  currentLocation?: GeoPoint | null;
};

type CacheKey = string;

type CachedSuggestions = {
  suggestions: PlaceSuggestion[];
  timestamp: number;
};

const CACHE_DURATION_MS = 5 * 60 * 1000;

function buildCacheKey(query: string, location: GeoPoint | null): CacheKey {
  if (!location) {
    return query.trim().toLowerCase();
  }
  return `${query.trim().toLowerCase()}::${location.latitude.toFixed(4)},${location.longitude.toFixed(4)}`;
}

export function usePlacesSearch(
  args: UsePlacesSearchArgs = {},
): PlacesSearchState {
  const { currentLocation = null } = args;
  const [queryValue, setQueryState] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [activeTarget, setActiveTarget] = useState<PlaceSuggestion | null>(null);
  const [fetchState, setFetchState] = useState<FetchState>("idle");
  const cacheRef = useRef<Map<CacheKey, CachedSuggestions>>(
    () => new Map<CacheKey, CachedSuggestions>(),
  );
  const locationRef = useRef<GeoPoint | null>(currentLocation);

  useEffect(() => {
    locationRef.current = currentLocation ?? null;
  }, [currentLocation]);

  const setQueryValue = useCallback((next: string) => {
    setQueryState(next);
    if (!next.trim()) {
      setSuggestions([]);
      setFetchState("idle");
    }
  }, []);

  const selectSuggestion = useCallback((suggestion: PlaceSuggestion) => {
    setActiveTarget(suggestion);
    setQueryState(suggestion.primaryText);
    setSuggestions([]);
  }, []);

  const getSuggestionsFromCache = useCallback(
    (query: string, coordinates: GeoPoint | null) => {
      const key = buildCacheKey(query, coordinates);
      const cache = cacheRef.current;
      const entry = cache.get(key);
      if (
        entry &&
        Date.now() - entry.timestamp < CACHE_DURATION_MS
      ) {
        return entry.suggestions;
      }
      return null;
    },
    [],
  );

  const saveSuggestionsToCache = useCallback(
    (query: string, coordinates: GeoPoint | null, data: PlaceSuggestion[]) => {
      const key = buildCacheKey(query, coordinates);
      cacheRef.current.set(key, {
        suggestions: data,
        timestamp: Date.now(),
      });
    },
    [],
  );

  // TODO: Places API fetch実装（Netlify Functions経由）
  const fetchSuggestions = useCallback(
    async (query: string) => {
      const coordinates = locationRef.current;
      const cached = getSuggestionsFromCache(query, coordinates);
      if (cached) {
        setSuggestions(cached);
        return;
      }

      setFetchState("loading");
      try {
        // プレースホルダ：API実装前は候補なし
        const data: PlaceSuggestion[] = [];
        setSuggestions(data);
        saveSuggestionsToCache(query, coordinates, data);
        setFetchState("idle");
      } catch (error) {
        console.error("[usePlacesSearch] fetch error", error);
        setFetchState("error");
      }
    },
    [getSuggestionsFromCache, saveSuggestionsToCache],
  );

  useEffect(() => {
    const trimmed = queryValue.trim();
    if (!trimmed) {
      return;
    }
    fetchSuggestions(trimmed);
  }, [queryValue, fetchSuggestions]);

  const api = useMemo(
    () => ({
      queryValue,
      setQueryValue,
      suggestions,
      isLoading: fetchState === "loading",
      activeTarget,
      selectSuggestion,
      fetchSuggestions,
    }),
    [
      queryValue,
      setQueryValue,
      suggestions,
      fetchState,
      activeTarget,
      selectSuggestion,
      fetchSuggestions,
    ],
  );

  return {
    queryValue: api.queryValue,
    setQueryValue: api.setQueryValue,
    suggestions: api.suggestions,
    isLoading: api.isLoading,
    activeTarget: api.activeTarget,
    selectSuggestion: api.selectSuggestion,
  };
}
