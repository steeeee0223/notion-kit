import { useMouse } from "@uidotdev/usehooks";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

import { ROW_HEIGHT } from "./constants";
import {
  useTimelineContext,
  useTimelineScrollX,
  useTimelineSidebarWidth,
} from "./timeline-provider";
import { getDateByMousePosition } from "./utils";

interface TimelineAddFeatureHelperProps {
  top: number;
  className?: string;
  style?: React.CSSProperties;
}

export function TimelineAddFeatureHelper({
  top,
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

    timeline.onAddItem?.(currentDate.getTime());
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
        className="flex h-full w-full items-center justify-center rounded-md border border-dashed p-2"
        onClick={handleClick}
        type="button"
      >
        <Icon.Plus className="pointer-events-none size-3 fill-icon select-none" />
      </button>
    </div>
  );
}
