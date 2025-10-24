"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GeoPoint } from "./types";

type PermissionState = "granted" | "prompt" | "denied" | "error" | "loading";

type CurrentPositionState = {
  status: PermissionState;
  coordinates: GeoPoint | null;
  accuracyMeters: number | null;
  errorMessage?: string;
  requestPermission: () => void;
};

type WatchCleanup = () => void;

function supportsGeolocation(): boolean {
  return typeof window !== "undefined" && "geolocation" in navigator;
}

function getPermissionLabel(state: PermissionState | PermissionState[]) {
  return Array.isArray(state) ? state[state.length - 1] : state;
}

export function useCurrentPosition(): CurrentPositionState {
  const [status, setStatus] = useState<PermissionState>("loading");
  const [coordinates, setCoordinates] = useState<GeoPoint | null>(null);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const watchCleanupRef = useRef<WatchCleanup | null>(null);

  const stopWatching = useCallback(() => {
    if (watchCleanupRef.current) {
      watchCleanupRef.current();
      watchCleanupRef.current = null;
    }
  }, []);

  const startWatching = useCallback(() => {
    if (!supportsGeolocation()) {
      setStatus("error");
      setErrorMessage("位置情報APIに未対応の端末です。");
      return;
    }

    stopWatching();
    setStatus("loading");
    setErrorMessage(undefined);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setAccuracyMeters(position.coords.accuracy ?? null);
        setStatus("granted");
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setStatus("denied");
            setErrorMessage("位置情報アクセスが拒否されました。");
            break;
          case error.POSITION_UNAVAILABLE:
            setStatus("error");
            setErrorMessage("位置情報が取得できませんでした。");
            break;
          case error.TIMEOUT:
            setStatus("error");
            setErrorMessage("位置情報の取得がタイムアウトしました。");
            break;
          default:
            setStatus("error");
            setErrorMessage("予期しないエラーが発生しました。");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      },
    );

    watchCleanupRef.current = () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [stopWatching]);

  const evaluatePermission = useCallback(() => {
    if (!supportsGeolocation()) {
      setStatus("error");
      setErrorMessage("位置情報APIに未対応の端末です。");
      return;
    }

    if (!navigator.permissions?.query) {
      setStatus("prompt");
      return;
    }

    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        const currentState = getPermissionLabel(result.state as PermissionState);
        if (currentState === "granted") {
          startWatching();
        } else {
          setStatus(currentState);
        }

        result.onchange = () => {
          const nextState = getPermissionLabel(result.state as PermissionState);
          if (nextState === "granted") {
            startWatching();
          } else {
            stopWatching();
            setStatus(nextState);
          }
        };
      })
      .catch(() => {
        setStatus("prompt");
      });
  }, [startWatching, stopWatching]);

  useEffect(() => {
    evaluatePermission();
    return () => {
      stopWatching();
    };
  }, [evaluatePermission, stopWatching]);

  const requestPermission = useCallback(() => {
    startWatching();
  }, [startWatching]);

  return {
    status,
    coordinates,
    accuracyMeters,
    errorMessage,
    requestPermission,
  };
}
