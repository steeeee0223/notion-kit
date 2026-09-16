import { format } from "date-fns";

import { cn } from "@notion-kit/cn";

import { Button } from "@/primitives";

import { useCalendarContext } from "./calendar-context";
import { CalendarEventContent, DefaultCalendarEvent } from "./calendar-event";
import { dayKey, zonedDate } from "./date-utils";
import { layoutDayEvents, monthDays } from "./month-layout";
import type { CalendarEventRenderer } from "./types";

export interface CalendarMonthProps extends React.ComponentProps<"div"> {
  renderEvent?: CalendarEventRenderer;
}
export function CalendarMonth({
  renderEvent = DefaultCalendarEvent,
  className,
  ...props
}: CalendarMonthProps) {
  const calendar = useCalendarContext();
  const { timeZone } = calendar;
  const rows = layoutDayEvents(
    calendar.events,
    monthDays(calendar.anchorDate, timeZone, calendar.weekStartsOn),
    timeZone,
  );
  const month = zonedDate(calendar.anchorDate, timeZone).getMonth();
  const today = dayKey(calendar.now, timeZone);
  return (
    <div
      {...props}
      role="group"
      aria-label="Month calendar"
      data-slot="calendar-month"
      className={cn("min-w-0", className)}
    >
      {rows.map((row) => (
        <div
          key={row.days[0]}
          data-slot="calendar-month-week"
          className="relative grid grid-cols-7 border-b"
          style={{ minHeight: Math.max(120, 40 + row.laneCount * 30) }}
        >
          {row.days.map((day) => {
            const date = zonedDate(day, timeZone);
            return (
              <Button
                key={day}
                variant={null}
                data-calendar-drop="month"
                data-day={day}
                aria-label={`Create event on ${format(date, "MMMM d, yyyy")}`}
                aria-disabled={!calendar.canCreate}
                className={cn(
                  "flex h-full min-w-0 items-start justify-end rounded-none border-s px-2 py-1 text-xs",
                  [0, 6].includes(date.getDay()) && "bg-default/3",
                  date.getMonth() !== month && "text-muted",
                )}
                onClick={() => {
                  if (calendar.canCreate && !calendar.suppressClick.current)
                    calendar.onCreate?.({
                      startAt: day,
                      endAt: null,
                      allDay: true,
                    });
                }}
              >
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full",
                    dayKey(day, timeZone) === today && "bg-red-500 text-white",
                  )}
                >
                  {date.getDate()}
                </span>
              </Button>
            );
          })}
          {row.segments.map((segment) => (
            <div
              key={`${segment.event === calendar.draft ? "draft:" : ""}${segment.key}`}
              className="absolute min-w-0 px-1"
              style={{
                top: 32 + segment.lane * 30,
                left: `${(segment.column / 7) * 100}%`,
                width: `${(segment.span / 7) * 100}%`,
                height: 26,
              }}
            >
              <CalendarEventContent
                event={segment.event}
                segment={segment}
                renderEvent={renderEvent}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
