export function isCompassPermissionSupported() {
  const DeviceOrientation = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<string>;
  };
  return typeof DeviceOrientation?.requestPermission === "function";
}
