type DistanceLabelProps = {
  distanceMeters: number | null;
  accuracyMeters: number | null;
};

function formatDistance(distanceMeters: number) {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }
  return `${(distanceMeters / 1000).toFixed(1)} km`;
}

export function DistanceLabel({
  distanceMeters,
  accuracyMeters,
}: DistanceLabelProps) {
  if (distanceMeters === null) {
    return (
      <p className="text-sm text-neutral-300">距離情報を取得しています…</p>
    );
  }

  return (
    <div className="text-center text-sm">
      <p className="font-semibold text-white">{formatDistance(distanceMeters)}</p>
      {accuracyMeters !== null ? (
        <p className="text-xs text-neutral-400">精度 ±{Math.round(accuracyMeters)} m</p>
      ) : null}
    </div>
  );
}
