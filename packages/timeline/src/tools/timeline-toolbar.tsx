import React from "react";

import { cn } from "@notion-kit/cn";

import {
  useTimelineContainerWidth,
  useTimelineContext,
} from "../timeline-provider";
import { TimelineRange } from "../types";
import { TimelineJumpTo } from "./timeline-jump-to";
import { TimelineRangeSelect } from "./timeline-range-select";
import { TimelineSidebarTrigger } from "./timeline-sidebar";

export function TimelineToolbar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-toolbar"
      className={cn(
        "z-30 flex h-(--timeline-row-height) items-center bg-main",
        className,
      )}
      {...props}
    />
  );
}

export interface TimelineHeaderToolbarProps {
  onSidebarOpen?: () => void;
  onRangeChange: (range: TimelineRange) => void;
}

export function TimelineHeaderToolbar({
  onRangeChange,
  onSidebarOpen,
}: TimelineHeaderToolbarProps) {
  const timeline = useTimelineContext();
  const [containerWidth] = useTimelineContainerWidth();

  return (
    <div
      data-slot="timeline-header-toolbar"
      className="absolute inset-0 top-0 z-20 flex pointer-events-none"
    >
      {onSidebarOpen && (
        <TimelineToolbar className="sticky inset-s-0 top-px ps-3 pt-[7px] pointer-events-auto">
          <TimelineSidebarTrigger
            description="Show table"
            onClick={onSidebarOpen}
          />
        </TimelineToolbar>
      )}
      <TimelineToolbar
        className="sticky top-px pe-(--timeline-inline-padding) pt-[7px] pointer-events-auto"
        style={{
          insetInlineStart: containerWidth > 0 ? containerWidth - 270 : 0,
        }}
      >
        {/* Gradient fade */}
        <div
          className="-ms-7.5 h-full w-7.5"
          style={{
            backgroundImage: `linear-gradient(calc(var(--direction) * -90deg), var(--c-bacPri) 20%, var(--ca-conBacTra) 100%)`,
          }}
        />
        <TimelineRangeSelect value={timeline.range} onChange={onRangeChange} />
        <TimelineJumpTo />
      </TimelineToolbar>
    </div>
  );
}
