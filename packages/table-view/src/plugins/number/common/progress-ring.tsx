import { COLOR, type Color } from "@notion-kit/utils";

interface ProgressRingProps {
  value: number;
  valueMax: number;
  color: Color;
}

export function ProgressRing({ value, valueMax, color }: ProgressRingProps) {
  const r = 6;
  const circumference = 2 * Math.PI * r;
  const progress = Math.min(Math.max(value, 0), valueMax);
  const offset = circumference * (1 - progress / valueMax);

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={valueMax}
      aria-label={`Loading progress: ${value}%`}
      className="inline-flex"
    >
      <svg
        viewBox="0 0 14 14"
        width="21"
        height="21"
        aria-hidden="true"
        focusable="false"
        className="size-[21px] shrink-0"
      >
        <circle
          cx="7"
          cy="7"
          r={r}
          fill="none"
          strokeWidth="2"
          className="stroke-default/10"
        />
        <g transform="rotate(-90 7 7)">
          <circle
            cx="7"
            cy="7"
            r={r}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              stroke: COLOR[color].hex,
              transition: "stroke-dashoffset 0.5s ease-out",
            }}
          />
        </g>
      </svg>
    </div>
  );
}
