"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeHeadingDegrees } from "./utils";

type PermissionState = "granted" | "prompt" | "denied" | "error" | "loading";

type HeadingState = {
  status: PermissionState;
  headingDegrees: number | null;
  errorMessage?: string;
  requestPermission: () => Promise<void>;
};

type DeviceOrientationEventWithWebkit = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
  webkitCompassAccuracy?: number;
};

function supportsDeviceOrientation() {
  return typeof window !== "undefined" && "ondeviceorientation" in window;
}

export function useHeadingSensor(): HeadingState {
  const [status, setStatus] = useState<PermissionState>("prompt");
  const [headingDegrees, setHeadingDegrees] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const listenerRef = useRef<() => void>();

  const clearListener = useCallback(() => {
    if (listenerRef.current) {
      listenerRef.current();
      listenerRef.current = undefined;
    }
  }, []);

  const handleOrientation = useCallback((event: DeviceOrientationEventWithWebkit) => {
    const { alpha } = event;
    const webkitHeading = event.webkitCompassHeading;

    let heading: number | null = null;
    if (typeof webkitHeading === "number") {
      heading = normalizeHeadingDegrees(webkitHeading);
    } else if (typeof alpha === "number") {
      // deviceorientation のalphaは時計回り、北=0度
      heading = normalizeHeadingDegrees(360 - alpha);
    }

    if (heading !== null) {
      setHeadingDegrees(heading);
      setStatus("granted");
    }
  }, []);

  const startListening = useCallback(() => {
    if (!supportsDeviceOrientation()) {
      setStatus("error");
      setErrorMessage("方位センサーに対応していません。");
      return;
    }

    clearListener();
    const handler = (event: DeviceOrientationEvent) => {
      handleOrientation(event as DeviceOrientationEventWithWebkit);
    };
    window.addEventListener("deviceorientation", handler, true);
    listenerRef.current = () => {
      window.removeEventListener("deviceorientation", handler, true);
    };
  }, [clearListener, handleOrientation]);

  useEffect(() => {
    return () => {
      clearListener();
    };
  }, [clearListener]);

  const requestPermission = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(undefined);

    try {
      const DeviceOrientation = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<PermissionState>;
      };
      if (typeof DeviceOrientation?.requestPermission === "function") {
        const result = await DeviceOrientation.requestPermission();
        if (result !== "granted") {
          setStatus("denied");
          setErrorMessage("コンパス機能の許可が必要です。");
          return;
        }
      }
      startListening();
      setStatus("granted");
    } catch (error) {
      console.error("[useHeadingSensor] request error", error);
      setStatus("error");
      setErrorMessage("コンパス機能を読み取れませんでした。");
    }
  }, [startListening]);

  return {
    status,
    headingDegrees,
    errorMessage,
    requestPermission,
  };
}
