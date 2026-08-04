import { useState } from "react";
import { useMouse } from "@uidotdev/usehooks";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

import { ROW_HEIGHT } from "./constants";
import {
  useTimelineContext,
  useTimelineScrollX,
  useTimelineSidebarWidth,
} from "./timeline-provider";
import { getDateByMousePosition, resolveColumnWidth } from "./utils";

interface TimelineAddFeatureHelperProps {
  top: number;
  ariaLabel?: string;
  onAddItem?: (ts: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function TimelineAddFeatureHelper({
  top,
  ariaLabel,
  onAddItem,
  className,
  style,
}: TimelineAddFeatureHelperProps) {
  const [scrollX] = useTimelineScrollX();
  const [sidebarWidth] = useTimelineSidebarWidth();
  const timeline = useTimelineContext();
  const [mousePosition, mouseRef] = useMouse<HTMLDivElement>();

  const handleClick = () => {
    const timelineRect = timeline.ref?.current?.getBoundingClientRect();
    const x =
      mousePosition.x - (timelineRect?.left ?? 0) + scrollX - sidebarWidth;
    const currentDate = getDateByMousePosition(timeline, x);

    (onAddItem ?? timeline.onAddItem)?.(currentDate.getTime());
  };

  return (
    <div
      data-slot="timeline-add-feature-helper"
      className={cn("absolute top-0 px-0.5", className)}
      ref={mouseRef}
      style={{
        marginTop: -ROW_HEIGHT / 2,
        transform: `translateY(${top}px)`,
        ...style,
      }}
    >
      <button
        aria-label={ariaLabel}
        className="flex size-full items-center justify-center rounded-md border border-dashed p-2"
        onClick={handleClick}
        type="button"
      >
        <Icon.Plus className="pointer-events-none size-3 fill-icon select-none" />
      </button>
    </div>
  );
}

interface TimelineAddFeatureTrackProps
  extends Omit<React.ComponentProps<"div">, "onMouseMove"> {
  ariaLabel?: string;
  onAddItem: (ts: number) => void;
}

export function TimelineAddFeatureTrack({
  ariaLabel,
  onAddItem,
  className,
  onMouseLeave,
  ...props
}: TimelineAddFeatureTrackProps) {
  const timeline = useTimelineContext();
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const columnWidth = resolveColumnWidth(timeline.range, timeline.zoom);
  const columnStart =
    hoveredColumn === null ? null : hoveredColumn * columnWidth;

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (timeline.timelineData.subRanges.length === 0) return;
    const x = event.clientX - event.currentTarget.getBoundingClientRect().left;
    const nextColumn = Math.floor(x / columnWidth);
    const lastColumn = timeline.timelineData.subRanges.length - 1;
    setHoveredColumn(Math.min(Math.max(nextColumn, 0), lastColumn));
  };

  return (
    <div
      {...props}
      data-slot="timeline-add-feature-track"
      className={cn("relative h-(--timeline-row-height)", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={(event) => {
        setHoveredColumn(null);
        onMouseLeave?.(event);
      }}
    >
      {columnStart === null ? null : (
        <TimelineAddFeatureHelper
          top={ROW_HEIGHT / 2}
          ariaLabel={ariaLabel}
          style={{ left: columnStart, width: columnWidth }}
          onAddItem={() => {
            const date = getDateByMousePosition(timeline, columnStart);
            onAddItem(date.getTime());
          }}
        />
      )}
    </div>
  );
}
