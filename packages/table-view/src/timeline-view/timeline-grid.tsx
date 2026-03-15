"use client";

import type { UseTimelineScaleReturn } from "./use-timeline-scale";

interface TimelineGridProps {
  scale: UseTimelineScaleReturn;
}

export function TimelineGrid({ scale }: TimelineGridProps) {
  const gridLines = scale.getGridLines();

  return (
    <div className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden">
      {gridLines.map((line, i) => (
        <div
          key={i}
          className={
            line.isWeekend
              ? "absolute h-full bg-[var(--cd-timDarBac)]"
              : "absolute h-full border-e border-[var(--ca-borSecTra)]"
          }
          style={{
            insetInlineStart: line.left,
            ...(line.isWeekend ? { width: scale.config.tickWidthPx } : {}),
          }}
        />
      ))}
      <div
        className="absolute h-full border-e border-[var(--c-redBorAccPri)]"
        style={{ insetInlineStart: scale.todayX }}
      />
    </div>
  );
}
