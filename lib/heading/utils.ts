export function normalizeHeadingDegrees(value: number) {
  const normalized = ((value % 360) + 360) % 360;
  return normalized;
}

export function normalizeRelativeDegrees(value: number) {
  const normalized =
    ((value + 180) % 360 + 360) % 360 - 180;
  return normalized;
}

export function quantizeDegrees(value: number, step: number) {
  if (step <= 0) {
    return value;
  }
  return Math.round(value / step) * step;
}

export function unwrapAngle(
  current: number,
  previousRaw: number | null,
  previousUnwrapped: number | null,
) {
  if (previousRaw === null || previousUnwrapped === null) {
    return {
      raw: current,
      unwrapped: current,
    };
  }

  const delta = normalizeRelativeDegrees(current - previousRaw);
  return {
    raw: current,
    unwrapped: previousUnwrapped + delta,
  };
}

export function clampRotationStep(
  current: number,
  target: number,
  maxStep: number,
) {
  const delta = target - current;
  if (Math.abs(delta) <= maxStep) {
    return target;
  }
  return current + Math.sign(delta) * maxStep;
}
