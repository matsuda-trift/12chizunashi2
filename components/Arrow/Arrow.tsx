type ArrowProps = {
  rotationDegrees: number;
};

const ARROW_COLOR = "#ff2d55";

export function Arrow({ rotationDegrees }: ArrowProps) {
  return (
    <div className="flex items-center justify-center">
      <svg
        role="img"
        aria-label="目的地方向"
        className="h-40 w-40 transition-transform duration-200"
        style={{ transform: `rotate(${rotationDegrees}deg)` }}
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="#ffffff33"
          strokeWidth="2"
        />
        <polygon
          points="50,10 70,60 50,52 30,60"
          fill={ARROW_COLOR}
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="70" r="6" fill={ARROW_COLOR} />
      </svg>
    </div>
  );
}
