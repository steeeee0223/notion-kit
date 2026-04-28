import { useMemo } from "react";
import { formatDate } from "date-fns";

import { Button, TooltipPreset } from "@notion-kit/shadcn";

import { useTimelineContext } from "../timeline-provider";
import { getOffset } from "../utils";

export function TimelineToday() {
  const date = useMemo(() => new Date(), []);
  const label = formatDate(date, "dd");
  const description = formatDate(date, "EEEE, MMM dd, yyyy");

  const timeline = useTimelineContext();
  const pixelOffset = useMemo(
    () => getOffset(date, timeline),
    [date, timeline],
  );

  return (
    <div
      data-slot="timeline-today"
      className="pointer-events-none absolute top-(--timeline-today-top) left-0 z-20 flex h-full flex-col items-center justify-center overflow-visible select-none [--timeline-today-top:36px]"
      style={{
        width: 0,
        transform: `translateX(${pixelOffset}px)`,
      }}
    >
      <TooltipPreset side="top" description={description}>
        <Button
          variant="red-fill"
          size="circle"
          className="pointer-events-auto sticky top-(--timeline-today-top) size-[22px] text-xs"
        >
          {label}
        </Button>
      </TooltipPreset>
      <div className="mt-1 size-1.5 rounded-full bg-red" />
      <div className="h-full w-px bg-red" />
    </div>
  );
}
