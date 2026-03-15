"use client";

import type { UseTimelineScaleReturn } from "./use-timeline-scale";

interface TimelineHeaderProps {
  scale: UseTimelineScaleReturn;
}

export function TimelineHeader({ scale }: TimelineHeaderProps) {
  const majorLabels = scale.getMajorLabels();
  const minorLabels = scale.getMinorLabels();

  return (
    <div className="sticky top-0 z-[100] h-[68px] w-full">
      <div className="relative h-[34px] w-full border-b border-[var(--ca-borSecTra)]">
        {majorLabels.map((item, i) => (
          <div
            key={i}
            className="absolute flex h-full items-end px-2 pb-1 text-xs text-[var(--c-texSec)]"
            style={{ insetInlineStart: item.left, width: item.width }}
          >
            <span className="truncate font-medium">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="relative h-[34px] w-full border-b border-[var(--ca-borSecTra)]">
        {minorLabels.map((item, i) => (
          <div
            key={i}
            className="absolute flex h-full items-center justify-center text-xs text-[var(--c-texSec)]"
            style={{ insetInlineStart: item.left, width: item.width }}
          >
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
