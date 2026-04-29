"use client";

import type { FC } from "react";
import { memo, useCallback, useMemo } from "react";
import { useMouse, useThrottle, useWindowScroll } from "@uidotdev/usehooks";
import { formatDate } from "date-fns";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@notion-kit/shadcn";

import { useTimelineContext } from "./timeline-provider";
import { getDateByMousePosition, getOffset } from "./utils";

export interface GanttMarkerProps {
  id: string;
  date: number;
  label: string;
}

export interface GanttCreateMarkerTriggerProps {
  onCreateMarker: (ts: number) => void;
  className?: string;
}

export const GanttCreateMarkerTrigger: FC<GanttCreateMarkerTriggerProps> = ({
  onCreateMarker,
  className,
}) => {
  const timeline = useTimelineContext();
  const [mousePosition, mouseRef] = useMouse<HTMLDivElement>();
  const [windowScroll] = useWindowScroll();
  const x = useThrottle(
    mousePosition.x -
      // eslint-disable-next-line react-hooks/refs, @typescript-eslint/no-unnecessary-condition
      (mouseRef.current?.getBoundingClientRect().x ?? 0) -
      (windowScroll.x ?? 0),
    10,
  );

  const date = getDateByMousePosition(timeline, x);

  const handleClick = () => onCreateMarker(date.getTime());

  return (
    <div
      className={cn(
        "group pointer-events-none absolute top-0 left-0 h-full w-full overflow-visible select-none",
        className,
      )}
      ref={mouseRef}
    >
      <div
        className="pointer-events-auto sticky top-6 z-20 -ml-2 flex w-4 flex-col items-center justify-center gap-1 overflow-visible opacity-0 group-hover:opacity-100"
        style={{ transform: `translateX(${x}px)` }}
      >
        <button
          className="bg-card z-50 inline-flex h-4 w-4 items-center justify-center rounded-full"
          onClick={handleClick}
          type="button"
        >
          <Icon.Plus className="size-3 fill-icon" />
        </button>
        <div className="rounded-full border border-border bg-main px-2 py-1 text-xs whitespace-nowrap text-primary backdrop-blur-lg">
          {formatDate(date, "MMM dd, yyyy")}
        </div>
      </div>
    </div>
  );
};

export const GanttMarker: FC<
  GanttMarkerProps & {
    onRemove?: (id: string) => void;
    className?: string;
  }
> = memo(({ label, date, id, onRemove, className }) => {
  const timeline = useTimelineContext();

  const pixelOffset = useMemo(
    () => getOffset(date, timeline),
    [date, timeline],
  );

  const handleRemove = useCallback(() => onRemove?.(id), [onRemove, id]);

  return (
    <div
      className="pointer-events-none absolute top-0 left-0 z-20 flex h-full flex-col items-center justify-center overflow-visible select-none"
      style={{
        width: 0,
        transform: `translateX(${pixelOffset}px)`,
      }}
    >
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className={cn(
              "group bg-card pointer-events-auto sticky top-0 flex flex-col flex-nowrap items-center justify-center rounded-b-md px-2 py-1 text-xs whitespace-nowrap text-primary select-auto",
              className,
            )}
          >
            {label}
            <span className="max-h-0 overflow-hidden opacity-80 transition-all group-hover:max-h-8">
              {formatDate(date, "MMM dd, yyyy")}
            </span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {onRemove ? (
            <ContextMenuItem
              className="flex items-center gap-2"
              onClick={handleRemove}
            >
              <Icon.Trash className="size-5 fill-red" />
              Remove marker
            </ContextMenuItem>
          ) : null}
        </ContextMenuContent>
      </ContextMenu>
      <div className={cn("bg-card h-full w-px", className)} />
    </div>
  );
});

GanttMarker.displayName = "GanttMarker";
