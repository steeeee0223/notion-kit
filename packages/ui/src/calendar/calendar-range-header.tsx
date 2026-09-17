import { format } from "date-fns";

import { cn } from "@notion-kit/cn";

import { useCalendarContext } from "./calendar-context";
import { dayKey, periodDays, zonedDate } from "./date-utils";
import { monthDays } from "./month-layout";

export function CalendarRangeHeader({
  className,
  style,
  ...props
}: React.ComponentProps<"div">) {
  const calendar = useCalendarContext();
  const days =
    calendar.range === "monthly"
      ? monthDays(
          calendar.anchorDate,
          calendar.timeZone,
          calendar.weekStartsOn,
        ).slice(0, 7)
      : periodDays(
          calendar.anchorDate,
          calendar.range,
          calendar.timeZone,
          calendar.weekStartsOn,
        );
  const today = dayKey(calendar.now, calendar.timeZone);
  return (
    <div
      {...props}
      data-slot="calendar-range-header"
      className={cn("sticky z-30 grid border-b bg-main", className)}
      style={{
        top: "var(--calendar-toolbar-height, 0px)",
        gridTemplateColumns:
          calendar.range === "monthly"
            ? `repeat(7,minmax(0,1fr))`
            : `56px repeat(${days.length},minmax(0,1fr))`,
        ...style,
      }}
    >
      {calendar.range !== "monthly" && <div />}
      {days.map((day) => {
        const date = zonedDate(day, calendar.timeZone);
        const weekend = [0, 6].includes(date.getDay());
        return (
          <div
            key={day}
            className={cn(
              "flex min-w-0 flex-col items-center gap-1 border-s py-2 text-xs text-secondary",
              weekend && "bg-default/3",
            )}
          >
            <span>{format(date, "EEE")}</span>
            {calendar.range !== "monthly" && (
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-base text-primary",
                  dayKey(day, calendar.timeZone) === today &&
                    "bg-red text-white",
                )}
              >
                {date.getDate()}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
