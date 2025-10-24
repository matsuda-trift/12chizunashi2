"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type SearchSuggestion = {
  id: string;
  title: string;
  subtitle?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  distanceMeters?: number;
};

type SearchBoxProps = {
  initialValue?: string;
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  onInputChange: (keyword: string) => void;
  onSelectSuggestion: (suggestion: SearchSuggestion) => void;
};

const DEBOUNCE_MS = 200;

export function SearchBox({
  initialValue = "",
  suggestions,
  isLoading,
  onInputChange,
  onSelectSuggestion,
}: SearchBoxProps) {
  const [keyword, setKeyword] = useState(initialValue);

  useEffect(() => {
    setKeyword(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onInputChange(keyword.trim());
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [keyword, onInputChange]);

  const suggestionsToRender = useMemo(() => {
    const unique = new Map<string, SearchSuggestion>();
    suggestions.forEach((item) => {
      unique.set(item.id, item);
    });
    return Array.from(unique.values()).slice(0, 5);
  }, [suggestions]);

  const handleSelect = useCallback(
    (suggestion: SearchSuggestion) => {
      onSelectSuggestion(suggestion);
    },
    [onSelectSuggestion],
  );

  return (
    <section className="flex w-full flex-col gap-3 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4 backdrop-blur">
      <label className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-300">
        DESTINATION
      </label>
      <div className="relative flex items-center gap-2 rounded-xl bg-black/60 px-4 py-3 ring-1 ring-inset ring-neutral-800 focus-within:ring-[#ff2d55]">
        <input
          className="w-full bg-transparent text-base text-white outline-none placeholder:text-neutral-500"
          placeholder="（例）富士山"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        {isLoading ? (
          <span className="text-xs text-neutral-400">検索中…</span>
        ) : null}
      </div>
      {suggestionsToRender.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {suggestionsToRender.map((suggestion) => (
            <li key={suggestion.id}>
              <button
                type="button"
                onClick={() => handleSelect(suggestion)}
                className="flex w-full flex-col gap-1 rounded-xl border border-transparent bg-black/40 px-4 py-3 text-left transition-colors hover:border-[#ff2d55]"
              >
                <span className="text-sm font-semibold text-white">
                  {suggestion.title}
                </span>
                {suggestion.subtitle ? (
                  <span className="text-xs text-neutral-400">
                    {suggestion.subtitle}
                  </span>
                ) : null}
                {suggestion.distanceMeters !== undefined ? (
                  <span className="text-xs text-neutral-500">
                    距離 {Math.round(suggestion.distanceMeters)} m
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-neutral-300">
          候補はここに表示されます。同じ条件での再検索は自動で再利用します。
        </p>
      )}
    </section>
  );
}
