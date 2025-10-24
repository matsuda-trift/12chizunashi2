"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GeoPoint } from "../geo/types";
import { calculateHaversineDistance, isArrived } from "../geo/distance";
import {
  clampRotationStep,
  normalizeHeadingDegrees,
  normalizeRelativeDegrees,
  quantizeDegrees,
  unwrapAngle,
} from "./utils";

type UseCompassControllerArgs = {
  current: GeoPoint | null;
  target: GeoPoint | null;
  headingDegrees: number | null;
  accuracyMeters: number | null;
};

type CompassState = {
  arrowRotationDegrees: number;
  targetBearingDegrees: number | null;
  distanceMeters: number | null;
  accuracyMeters: number | null;
  isArrived: boolean;
};

const MAX_ROTATION_PER_FRAME = 16;
const DISPLAY_QUANTIZE_STEP = 7;
const HYSTERESIS_DEGREES = 3;

function calculateBearing(from: GeoPoint, to: GeoPoint) {
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const deltaLon = ((to.longitude - from.longitude) * Math.PI) / 180;

  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

  const theta = Math.atan2(y, x);
  return normalizeHeadingDegrees((theta * 180) / Math.PI);
}

export function useCompassController({
  current,
  target,
  headingDegrees,
  accuracyMeters,
}: UseCompassControllerArgs): CompassState {
  const [displayRotation, setDisplayRotation] = useState(0);
  const lastRawRef = useRef<number | null>(null);
  const lastUnwrappedRef = useRef<number | null>(null);

  const bearing = useMemo(() => {
    if (!current || !target) {
      return null;
    }
    return calculateBearing(current, target);
  }, [current, target]);

  const distanceMeters = useMemo(() => {
    if (!current || !target) {
      return null;
    }
    return calculateHaversineDistance(current, target);
  }, [current, target]);

  useEffect(() => {
    if (bearing === null || headingDegrees === null) {
      lastRawRef.current = null;
      lastUnwrappedRef.current = null;
      return;
    }

    const relative = normalizeRelativeDegrees(bearing - headingDegrees);
    const { raw, unwrapped } = unwrapAngle(
      relative,
      lastRawRef.current,
      lastUnwrappedRef.current,
    );
    lastRawRef.current = raw;
    lastUnwrappedRef.current = unwrapped;

    const quantized = quantizeDegrees(unwrapped, DISPLAY_QUANTIZE_STEP);

    setDisplayRotation((prev) => {
      const delta = quantized - prev;
      if (Math.abs(delta) <= HYSTERESIS_DEGREES) {
        return prev;
      }
      return clampRotationStep(prev, quantized, MAX_ROTATION_PER_FRAME);
    });
  }, [bearing, headingDegrees]);

  const normalizedDisplay = useMemo(() => {
    const normalized = ((displayRotation % 360) + 360) % 360;
    return normalized;
  }, [displayRotation]);

  return {
    arrowRotationDegrees: normalizedDisplay,
    targetBearingDegrees: bearing,
    distanceMeters,
    accuracyMeters,
    isArrived: isArrived({ distanceMeters, accuracyMeters }),
  };
}
