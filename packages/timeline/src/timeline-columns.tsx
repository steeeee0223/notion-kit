import React, { useCallback, useRef, useState } from "react";

import { cn } from "@notion-kit/cn";

import { TimelineAddFeatureHelper } from "./timeline-feature";
import { useTimelineContext, useTimelineDragging } from "./timeline-provider";
import { useVisibleRange } from "./use-visible-range";
import { resolveColumnWidth } from "./utils";

interface TimelineColumnProps {
  index: number;
  isColumnSecondary?: (item: number) => boolean;
}

export function TimelineColumn({
  index,
  isColumnSecondary,
}: TimelineColumnProps) {
  const timeline = useTimelineContext();
  const width = resolveColumnWidth(timeline.range, timeline.zoom);

  return (
    <div
      data-slot="timeline-column"
      className={cn(
        "absolute top-0 h-full",
        index > 0 && "border-l border-border",
        isColumnSecondary?.(index) && "bg-default/5",
      )}
      style={{ width, left: index * width }}
    />
  );
}

export interface TimelineColumnsProps {
  className?: string;
  /** Total number of columns across all ranges (used by virtualization). */
  totalColumns?: number;
  isColumnSecondary?: (item: number) => boolean;
}

/**
 * Virtualized column container.
 * Only visible columns are rendered. Mouse tracking is done once at this level
 * instead of per-column, eliminating hundreds of hook instances.
 */
export function TimelineColumns({
  totalColumns,
  isColumnSecondary,
  className,
}: TimelineColumnsProps) {
  const resolvedTotalColumns = totalColumns ?? 0;
  const timeline = useTimelineContext();
  const [dragging] = useTimelineDragging();
  const { startIndex, endIndex } = useVisibleRange();
  const columnWidth = resolveColumnWidth(timeline.range, timeline.zoom);
  const totalWidth = resolvedTotalColumns * columnWidth;

  // Lifted mouse tracking — single tracker for entire column area
  const mouseRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [mouseY, setMouseY] = useState(0);
  const [mouseX, setMouseX] = useState(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouseY(e.clientY - rect.top);
    setMouseX(e.clientX - rect.left + e.currentTarget.scrollLeft);
  }, []);

  const handleMouseEnter = () => setHovering(true);
  const handleMouseLeave = () => setHovering(false);

  // Clamp the end index to the actual column count
  const clampedEnd = Math.min(endIndex, resolvedTotalColumns - 1);
  const visibleCount = Math.max(0, clampedEnd - startIndex + 1);

  // Compute which subrange column the mouse is over
  const hoverColumnIndex = Math.floor(mouseX / columnWidth);
  const hoverColumnLeft = hoverColumnIndex * columnWidth;

  return (
    <div
      data-slot="timeline-columns"
      className={cn("relative", className)}
      style={{ width: totalWidth }}
      ref={mouseRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* Only visible columns are mounted */}
      {Array.from({ length: visibleCount }).map((_, i) => {
        const index = startIndex + i;
        return (
          <TimelineColumn
            key={index}
            index={index}
            isColumnSecondary={isColumnSecondary}
          />
        );
      })}
      {/* Add feature helper */}
      {!dragging && hovering && timeline.onAddItem && (
        <TimelineAddFeatureHelper
          top={mouseY}
          style={{
            left: hoverColumnLeft,
            width: columnWidth,
          }}
        />
      )}
    </div>
  );
}
