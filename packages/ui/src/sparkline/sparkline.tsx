import { cn } from "@notion-kit/cn";

export interface SparklineProps {
  /** The series to plot, oldest first. */
  data: number[];
  /**
   * A textual summary of the trend for assistive technology, e.g.
   * `"Revenue trend, up 12% over 7 days"`.
   */
  ariaLabel: string;
  /** Fills the area under the line with the current text color. */
  area?: boolean;
  /** Draws a dot over the last data point. */
  highlightLast?: boolean;
  /** @default 2 */
  strokeWidth?: number;
  className?: string;
}

const VIEWBOX_WIDTH = 100;
const VIEWBOX_HEIGHT = 32;

function toPoints(data: number[]): [number, number][] {
  if (data.length === 0) return [];
  if (data.length === 1) {
    return [
      [0, VIEWBOX_HEIGHT / 2],
      [VIEWBOX_WIDTH, VIEWBOX_HEIGHT / 2],
    ];
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = VIEWBOX_WIDTH / (data.length - 1);

  return data.map((value, index) => [
    index * step,
    VIEWBOX_HEIGHT - ((value - min) / range) * VIEWBOX_HEIGHT,
  ]);
}

/**
 * A dependency-free SVG line/area chart that fills its container width. Color
 * comes from `currentColor`, so set it with a text color utility on the
 * component or an ancestor.
 */
function Sparkline({
  data,
  ariaLabel,
  area = false,
  highlightLast = false,
  strokeWidth = 2,
  className,
}: SparklineProps) {
  const points = toPoints(data);
  const linePath = points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x},${y}`)
    .join(" ");
  const last = points.at(-1);
  const first = points.at(0);
  const areaPath =
    area && last && first
      ? `${linePath} L${last[0]},${VIEWBOX_HEIGHT} L${first[0]},${VIEWBOX_HEIGHT} Z`
      : undefined;

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      preserveAspectRatio="none"
      className={cn("h-8 w-full overflow-visible text-current", className)}
    >
      {areaPath && <path d={areaPath} fill="currentColor" fillOpacity={0.12} stroke="none" />}
      {points.length > 0 && (
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
      {highlightLast && last && (
        <circle
          cx={last[0]}
          cy={last[1]}
          r={2.5}
          fill="currentColor"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}

export { Sparkline };
