import React, { useMemo } from "react";

import { cn } from "@notion-kit/cn";

import { TimelineColumns } from "./timeline-columns";
import {
  useTimelineContext,
  useTimelineSidebarWidth,
} from "./timeline-provider";
import { TimelineSubRangeItem } from "./types";
import { useVisibleRange } from "./use-visible-range";
import { resolveColumnWidth } from "./utils";

/**
 * Precomputed range group with column-index positions,
 * used for laying out range titles in the header.
 */
interface RangeGroup {
  label: string;
  /** Global column index where this range starts */
  columnStartIndex: number;
  /** Number of sub-range columns belonging to this range */
  columnCount: number;
}

interface TimelineRangeProps {
  range: RangeGroup;
  colWidth: number;
}

function TimelineRange({ range, colWidth }: TimelineRangeProps) {
  const [sidebarWidth] = useTimelineSidebarWidth();

  return (
    <div
      data-slot="timeline-range"
      className="shrink-0"
      style={{ width: range.columnCount * colWidth }}
    >
      <div
        className="sticky inline-flex h-8 items-center px-3 pt-[13px] text-sm font-medium text-primary"
        style={{ insetInlineStart: sidebarWidth > 0 ? sidebarWidth : 40 }}
      >
        {range.label}
      </div>
    </div>
  );
}

interface TimelineSubRangeProps {
  subRanges: TimelineSubRangeItem[];
  width: number;
  startIndex: number;
}

const TimelineSubRangeRow = React.memo(function TimelineSubRangeRow({
  subRanges,
  width,
  startIndex,
}: TimelineSubRangeProps) {
  return (
    <div
      data-slot="timeline-sub-range-row"
      className="relative box-border h-8 overflow-hidden shadow-[inset_0_-1px_0_0_var(--color-border)]"
    >
      {subRanges.map((item, i) => {
        const index = startIndex + i;
        return (
          <div
            key={index}
            data-slot="timeline-sub-range"
            className={cn(
              "absolute top-0 flex h-7 items-center justify-center text-xs text-muted",
              item.isToday && "text-white",
            )}
            style={{ width, left: index * width }}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
});

interface TimelineRangeHeaderProps {
  className?: string;
}

export function TimelineRangeHeader({ className }: TimelineRangeHeaderProps) {
  const timeline = useTimelineContext();
  const { ranges, subRanges } = timeline.timelineData;
  const { startIndex, endIndex } = useVisibleRange();

  const resolvedColumnWidth = resolveColumnWidth(timeline.range, timeline.zoom);
  const totalWidth = subRanges.length * resolvedColumnWidth;

  // Precompute range groups with their column-index positions
  const rangeGroups = useMemo((): RangeGroup[] => {
    return ranges.reduce<{ groups: RangeGroup[]; colIndex: number }>(
      (acc, range, i) => {
        const nextRange = ranges[i + 1];
        const count = subRanges.filter(
          (sub) =>
            sub.start >= range.start &&
            (!nextRange || sub.start < nextRange.start),
        ).length;
        acc.groups.push({
          label: range.label,
          columnStartIndex: acc.colIndex,
          columnCount: count,
        });
        return { groups: acc.groups, colIndex: acc.colIndex + count };
      },
      { groups: [], colIndex: 0 },
    ).groups;
  }, [ranges, subRanges]);

  // Filter to range groups overlapping with the visible column window
  const visibleRangeGroups = useMemo(() => {
    return rangeGroups.filter((group) => {
      const groupEnd = group.columnStartIndex + group.columnCount;
      return groupEnd > startIndex && group.columnStartIndex <= endIndex;
    });
  }, [rangeGroups, startIndex, endIndex]);

  // Leading spacer width for range groups before the visible area
  const firstVisibleGroup = visibleRangeGroups[0];
  const spacerWidth = firstVisibleGroup
    ? firstVisibleGroup.columnStartIndex * resolvedColumnWidth
    : 0;

  return (
    <div
      data-slot="timeline-range-header"
      className={cn(
        "relative col-start-1 row-start-1 flex h-full flex-col",
        className,
      )}
      style={{ width: totalWidth }}
    >
      {/* Sticky header */}
      <div className="sticky top-0 z-20 h-(--timeline-header-height) w-full bg-main">
        {/* Primary range row */}
        <div
          className="flex h-(--timeline-row-height)"
          style={{ width: totalWidth }}
        >
          {spacerWidth > 0 && (
            <div style={{ width: spacerWidth, flexShrink: 0 }} />
          )}
          {visibleRangeGroups.map((group) => (
            <TimelineRange
              key={`${group.label}-${group.columnStartIndex}`}
              range={group}
              colWidth={resolvedColumnWidth}
            />
          ))}
        </div>
        {/* Sub-range row */}
        <TimelineSubRangeRow
          subRanges={subRanges.slice(startIndex, endIndex + 1)}
          startIndex={startIndex}
          width={resolvedColumnWidth}
        />
      </div>
      {/* Columns — placed absolutely to fill the remaining height */}
      <TimelineColumns
        isColumnSecondary={(index) => index % 2 === 1}
        className="absolute inset-x-0 top-(--timeline-header-height) bottom-0 flex-1"
      />
    </div>
  );
}
