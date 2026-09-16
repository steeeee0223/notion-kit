import { format } from "date-fns";

import { cn } from "@notion-kit/cn";

import { Button } from "@/primitives";

import { useCalendarContext } from "./calendar-context";
import { CalendarEventContent, DefaultCalendarEvent } from "./calendar-event";
import { HOUR, localTime, periodDays, zonedDate } from "./date-utils";
import { layoutDayEvents } from "./month-layout";
import { layoutTimedEvents, MIN_VISUAL_MINUTES } from "./time-grid-layout";
import type { CalendarEventRenderer } from "./types";

export interface CalendarTimeGridProps extends React.ComponentProps<"div"> {
  renderEvent?: CalendarEventRenderer;
}
export function CalendarTimeGrid({
  renderEvent = DefaultCalendarEvent,
  className,
  ...props
}: CalendarTimeGridProps) {
  const calendar = useCalendarContext();
  const { timeZone } = calendar;
  const days = periodDays(
    calendar.anchorDate,
    calendar.range,
    timeZone,
    calendar.weekStartsOn,
  );
  const allDay = layoutDayEvents(
    calendar.events.filter((event) => event.allDay),
    days,
    timeZone,
    days.length,
    "all-day",
  )[0]!;
  const timed = layoutTimedEvents(calendar.events, days, timeZone);
  return (
    <div {...props} className={cn("min-w-0", className)}>
      <div
        role="group"
        aria-label="All-day events"
        data-slot="calendar-all-day"
        className="relative border-b ps-14"
      >
        <span className="absolute inset-s-0 top-3 w-14 text-center text-[10px] text-secondary">
          All day
        </span>
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: `repeat(${days.length},minmax(0,1fr))`,
            height: Math.max(44, allDay.laneCount * 30 + 12),
          }}
        >
          {days.map((day) => (
            <Button
              key={day}
              variant={null}
              data-calendar-drop="all-day"
              data-day={day}
              aria-label={`Create event on ${format(zonedDate(day, timeZone), "MMMM d, yyyy")}`}
              aria-disabled={!calendar.canCreate}
              className="h-full min-w-0 rounded-none border-s"
              onClick={() => {
                if (calendar.canCreate && !calendar.suppressClick.current)
                  calendar.onCreate?.({
                    startAt: day,
                    endAt: null,
                    allDay: true,
                  });
              }}
            />
          ))}
          {allDay.segments.map((segment) => (
            <div
              key={`${segment.event === calendar.draft ? "draft:" : ""}${segment.key}`}
              className="absolute px-1"
              style={{
                top: 6 + segment.lane * 30,
                left: `${(segment.column / days.length) * 100}%`,
                width: `${(segment.span / days.length) * 100}%`,
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
      </div>
      <div
        data-slot="calendar-time-grid"
        className="relative ms-14 grid"
        style={{
          height: 1440,
          gridTemplateColumns: `repeat(${days.length},minmax(0,1fr))`,
          backgroundImage:
            "repeating-linear-gradient(to bottom, var(--color-border) 0px, var(--color-border) 1px, transparent 1px, transparent 60px), repeating-linear-gradient(to bottom, transparent 0px, transparent 29px, color-mix(in srgb, var(--color-border) 45%, transparent) 29px, color-mix(in srgb, var(--color-border) 45%, transparent) 30px, transparent 30px, transparent 60px)",
          backgroundSize: "100% 60px",
        }}
      >
        {Array.from({ length: 24 }, (_, hour) => (
          <span
            key={hour}
            className="pointer-events-none absolute -inset-s-14 w-14 pe-2 text-end text-[10px] text-secondary"
            style={{ top: hour * 60 - 7 }}
          >
            {hour === 0 ? "" : `${String(hour).padStart(2, "0")}:00`}
          </span>
        ))}
        {days.map((day) => (
          <Button
            key={day}
            variant={null}
            data-calendar-drop="time"
            data-day={day}
            aria-label={`Create timed event on ${format(zonedDate(day, timeZone), "MMMM d, yyyy")}`}
            aria-disabled={!calendar.canCreate}
            className="h-full min-w-0 rounded-none border-s"
            onClick={(click) => {
              if (!calendar.canCreate || calendar.suppressClick.current) return;
              const minute =
                click.detail === 0
                  ? 480
                  : Math.min(
                      1425,
                      Math.max(
                        0,
                        Math.floor(
                          (click.clientY -
                            click.currentTarget.getBoundingClientRect().top) /
                            15,
                        ) * 15,
                      ),
                    );
              const startAt = localTime(day, minute, timeZone);
              calendar.onCreate?.({
                startAt,
                endAt: startAt + HOUR,
                allDay: false,
              });
            }}
          />
        ))}
        {timed.map((segment) => (
          <div
            key={`${segment.event === calendar.draft ? "draft:" : ""}${segment.key}`}
            className="absolute min-w-0 px-px"
            style={{
              top: segment.startMinute,
              height: Math.min(
                1440 - segment.startMinute,
                Math.max(
                  MIN_VISUAL_MINUTES,
                  segment.endMinute - segment.startMinute,
                ),
              ),
              left: `${((segment.lane + segment.column / segment.columnCount) / days.length) * 100}%`,
              width: `${100 / days.length / segment.columnCount}%`,
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
    </div>
  );
}
