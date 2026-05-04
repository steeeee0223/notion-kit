import { useMemo } from "react";

import { OVERSCAN } from "./constants";
import {
  useTimelineContainerWidth,
  useTimelineContext,
  useTimelineScrollX,
  useTimelineSidebarWidth,
} from "./timeline-provider";
import { resolveColumnWidth } from "./utils";

export interface VisibleRange {
  /** First visible sub-range index (clamped to 0) */
  startIndex: number;
  /** Last visible sub-range index (clamped to total - 1) */
  endIndex: number;
  /** Current horizontal scroll position */
  scrollLeft: number;
}

/**
 * Computes which sub-range columns are currently visible in the viewport,
 * with per-range-type overscan for smooth scrolling.
 */
export function useVisibleRange(): VisibleRange {
  const [scrollLeft] = useTimelineScrollX();
  const [sidebarWidth] = useTimelineSidebarWidth();
  const [containerWidth] = useTimelineContainerWidth();
  const { range, zoom, timelineData } = useTimelineContext();

  return useMemo(() => {
    const totalColumns = timelineData.subRanges.length;
    if (totalColumns === 0) {
      return { startIndex: 0, endIndex: 0, scrollLeft };
    }

    const resolvedColumnWidth = resolveColumnWidth(range, zoom);
    // Visible area starts after the sidebar (which is sticky)
    const visibleStart = scrollLeft;
    const visibleEnd = scrollLeft + containerWidth - sidebarWidth;

    const overscan = OVERSCAN[range];
    const rawStart = Math.floor(visibleStart / resolvedColumnWidth) - overscan;
    const rawEnd = Math.ceil(visibleEnd / resolvedColumnWidth) + overscan;

    return {
      startIndex: Math.max(0, rawStart),
      endIndex: Math.min(totalColumns - 1, rawEnd),
      scrollLeft,
    };
  }, [scrollLeft, range, zoom, sidebarWidth, containerWidth, timelineData]);
}
