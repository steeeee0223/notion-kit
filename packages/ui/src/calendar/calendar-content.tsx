import { cn } from "@notion-kit/cn";

import { useCalendarContext } from "./calendar-context";
import { CalendarMonth } from "./calendar-month";
import { CalendarRangeHeader } from "./calendar-range-header";
import { CalendarTimeGrid } from "./calendar-time-grid";
import type { CalendarEventRenderer } from "./types";

export interface CalendarContentProps extends React.ComponentProps<"div"> {
  renderEvent?: CalendarEventRenderer;
}
export function CalendarContent({
  renderEvent,
  className,
  ...props
}: CalendarContentProps) {
  const calendar = useCalendarContext();
  return (
    <div
      {...props}
      data-slot="calendar-content"
      className={cn("min-w-0", className)}
    >
      <CalendarRangeHeader />
      {calendar.range === "monthly" ? (
        <CalendarMonth renderEvent={renderEvent} />
      ) : (
        <CalendarTimeGrid renderEvent={renderEvent} />
      )}
    </div>
  );
}
