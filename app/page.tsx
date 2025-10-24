"use client";

import { useMemo } from "react";
import {
  Compass,
  SearchBox,
  StatusCard,
  type SearchSuggestion,
} from "../components";
import { usePlacesSearch } from "../lib/geo/usePlacesSearch";
import { useCurrentPosition } from "../lib/geo/useCurrentPosition";
import { useHeadingSensor } from "../lib/heading/useHeadingSensor";
import { useCompassController } from "../lib/heading/useCompassController";

export default function Home() {
  const {
    status: locationStatus,
    coordinates: currentCoords,
    accuracyMeters,
    errorMessage: locationError,
    requestPermission: requestLocationPermission,
  } = useCurrentPosition();

  const {
    status: headingStatus,
    headingDegrees,
    errorMessage: headingError,
    requestPermission: requestHeadingPermission,
  } = useHeadingSensor();

  const {
    queryValue,
    setQueryValue,
    suggestions,
    isLoading,
    selectSuggestion,
    activeTarget,
  } = usePlacesSearch({ currentLocation: currentCoords });

  const compass = useCompassController({
    current: currentCoords,
    target: activeTarget?.location ?? null,
    headingDegrees,
    accuracyMeters,
  });

  const mappedSuggestions: SearchSuggestion[] = useMemo(
    () =>
      suggestions.map((item) => ({
        id: item.id,
        title: item.primaryText,
        subtitle: item.secondaryText,
        location: item.location ?? undefined,
        distanceMeters: item.distanceMeters,
      })),
    [suggestions],
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col gap-6 px-5 py-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">
          チズナシ!
        </p>
        <h1 className="text-3xl font-semibold text-white">
          地図なしで目的地を目指そう。
        </h1>
      </header>

      <SearchBox
        initialValue={queryValue}
        suggestions={mappedSuggestions}
        isLoading={isLoading}
        onInputChange={setQueryValue}
        onSelectSuggestion={(suggestion) =>
          selectSuggestion({
            id: suggestion.id,
            primaryText: suggestion.title,
            secondaryText: suggestion.subtitle,
            location: suggestion.location ?? null,
            distanceMeters: suggestion.distanceMeters,
          })
        }
      />

      <Compass
        arrowRotationDegrees={compass.arrowRotationDegrees}
        targetBearingDegrees={compass.targetBearingDegrees}
        distanceMeters={compass.distanceMeters}
        accuracyMeters={compass.accuracyMeters}
        isArrived={compass.isArrived}
      />

      <StatusCard
        location={{
          state: locationStatus,
          message: locationError,
          onRequest: requestLocationPermission,
        }}
        heading={{
          state: headingStatus,
          message: headingError,
          onRequest: requestHeadingPermission,
        }}
      />

      <footer className="mt-auto flex flex-col items-start gap-2 border-t border-neutral-900 pt-4 text-xs text-neutral-500">
        <p>© 2025 Trift合同会社</p>
        <nav className="flex flex-wrap gap-3">
          <a
            className="underline decoration-neutral-700 underline-offset-4 hover:text-white"
            href="https://www.trift3.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            プライバシーポリシー
          </a>
          <a
            className="underline decoration-neutral-700 underline-offset-4 hover:text-white"
            href="https://www.trift3.com/terms"
            target="_blank"
            rel="noopener noreferrer"
          >
            利用規約
          </a>
          <a
            className="underline decoration-neutral-700 underline-offset-4 hover:text-white"
            href="https://www.trift3.com/legal"
            target="_blank"
            rel="noopener noreferrer"
          >
            特定商取引法に基づく表記
          </a>
          <a
            className="underline decoration-neutral-700 underline-offset-4 hover:text-white"
            href="https://www.trift3.com/contact"
            target="_blank"
            rel="noopener noreferrer"
          >
            お問い合わせ
          </a>
        </nav>
      </footer>
    </main>
  );
}
