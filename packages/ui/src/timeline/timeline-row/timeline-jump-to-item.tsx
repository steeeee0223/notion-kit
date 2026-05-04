import { useMemo } from "react";
import { format } from "date-fns";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

import { Button, TooltipPreset } from "@/primitives";

import {
  useTimelineContainerWidth,
  useTimelineContext,
  useTimelineScrollX,
  useTimelineSidebarWidth,
} from "../timeline-provider";
import type { TimelineFeature } from "../types";
import { getOffset } from "../utils";

const SCROLL_BUTTON_WIDTH = 220;
const scrollButtons = [
  {
    side: "left",
    tooltipSide: "right",
  },
  {
    side: "right",
    tooltipSide: "left",
  },
] as const;

interface TimelineJumpToItemProps {
  /**
   * The timeline item data
   */
  item: TimelineFeature;
}

export function TimelineJumpToItem({ item }: TimelineJumpToItemProps) {
  const timeline = useTimelineContext();
  const [scrollX] = useTimelineScrollX();
  const [sidebarWidth] = useTimelineSidebarWidth();
  const [containerWidth] = useTimelineContainerWidth();

  // TODO determined by range type, currently use the format `Apr 16, 2026`
  const timeStr = format(item.startAt, "MMM dd, yyyy");

  const visibleWidth = containerWidth - sidebarWidth;

  const isLeftOutOfBounds = useMemo(() => {
    const endOffset = getOffset(item.endAt, timeline);
    // If the item ends before the current viewport (excluding sidebar)
    return endOffset < scrollX;
  }, [item.endAt, timeline, scrollX]);

  const isRightOutOfBounds = useMemo(() => {
    const startOffset = getOffset(item.startAt, timeline);
    // If the item starts after the current viewport
    return startOffset > scrollX + visibleWidth;
  }, [item.startAt, timeline, scrollX, visibleWidth]);

  return (
    <div data-slot="timeline-jump-to-item" className="relative z-860 flex h-0">
      {scrollButtons.map((el) => {
        return (
          <div
            key={el.side}
            className={cn(
              "pointer-events-none sticky mt-0.5 flex h-7.5 cursor-pointer items-center",
              el.side === "right" && "flex-row-reverse",
            )}
            style={{
              width: SCROLL_BUTTON_WIDTH,
              insetInlineStart:
                el.side === "right" && visibleWidth
                  ? visibleWidth - SCROLL_BUTTON_WIDTH + sidebarWidth
                  : sidebarWidth,
            }}
          >
            <TooltipPreset description={timeStr} side={el.tooltipSide}>
              <Button
                className={cn(
                  "pointer-events-auto mx-2 my-1 size-3.5 shrink-0 bg-icon-secondary opacity-0 transition-opacity duration-200 hover:bg-icon-primary",
                  el.side === "left" && isLeftOutOfBounds && "opacity-100",
                  el.side === "right" && isRightOutOfBounds && "opacity-100",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  timeline.scrollToFeature(item);
                }}
              >
                <Icon.ArrowStraightFillSmall
                  side={el.side}
                  className="size-3 fill-main"
                />
              </Button>
            </TooltipPreset>
          </div>
        );
      })}
    </div>
  );
}
