type DirectionLabelProps = {
  bearingDegrees: number | null;
};

const directionList = [
  { code: "N", label: "北" },
  { code: "NE", label: "北東" },
  { code: "E", label: "東" },
  { code: "SE", label: "南東" },
  { code: "S", label: "南" },
  { code: "SW", label: "南西" },
  { code: "W", label: "西" },
  { code: "NW", label: "北西" },
];

function toDirectionCode(bearing: number) {
  const index = Math.round(bearing / 45) % directionList.length;
  return directionList[index < 0 ? index + directionList.length : index];
}

export function DirectionLabel({ bearingDegrees }: DirectionLabelProps) {
  if (bearingDegrees === null) {
    return (
      <p className="text-sm text-neutral-300">
        方角の取得を許可してください。
      </p>
    );
  }

  const { code, label } = toDirectionCode(bearingDegrees);

  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
        {code}
      </p>
      <p className="text-lg font-semibold text-white">{label}</p>
    </div>
  );
}
