"use client";

import { Arrow } from "../Arrow/Arrow";
import { DirectionLabel } from "../DirectionLabel/DirectionLabel";
import { DistanceLabel } from "../DistanceLabel/DistanceLabel";

type CompassProps = {
  arrowRotationDegrees: number;
  targetBearingDegrees: number | null;
  distanceMeters: number | null;
  accuracyMeters: number | null;
  isArrived: boolean;
};

export function Compass({
  arrowRotationDegrees,
  targetBearingDegrees,
  distanceMeters,
  accuracyMeters,
  isArrived,
}: CompassProps) {
  return (
    <section
      aria-label="目的地方向"
      className="relative flex aspect-square w-full max-w-[360px] flex-col items-center justify-center gap-6 rounded-full border border-neutral-800 bg-neutral-950/50 p-8 text-white shadow-[0_0_40px_rgba(17,17,17,0.45)] backdrop-blur"
    >
      <div className="absolute inset-4 rounded-full border border-neutral-900" />
      <Arrow rotationDegrees={arrowRotationDegrees} />
      <div className="flex flex-col items-center gap-2">
        <DirectionLabel bearingDegrees={targetBearingDegrees} />
        <DistanceLabel
          distanceMeters={distanceMeters}
          accuracyMeters={accuracyMeters}
        />
        {isArrived ? (
          <p className="rounded-full border border-[#ff2d55] px-3 py-1 text-xs font-semibold text-[#ff2d55]">
            目的地に到着しました
          </p>
        ) : null}
      </div>
    </section>
  );
}
