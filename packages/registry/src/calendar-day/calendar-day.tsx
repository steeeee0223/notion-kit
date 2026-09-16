"use client";

import { useState } from "react";

import {
  CalendarContent,
  CalendarHeaderToolbar,
  CalendarProvider,
  type CalendarEventData,
  type CalendarRange,
} from "@notion-kit/ui/calendar";

export default function CalendarDay() {
  const [range, setRange] = useState<CalendarRange>("daily");
  const [anchorDate, setAnchorDate] = useState(() => Date.now());
  const [events, setEvents] = useState<CalendarEventData[]>(() => {
    const date = new Date(anchorDate);
    const startAt = Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      9,
    );
    return [
      {
        id: "focus",
        name: "Focus time",
        startAt,
        endAt: startAt + 2 * 60 * 60 * 1000,
        allDay: false,
      },
    ];
  });

  return (
    <div className="w-full min-w-0">
      <CalendarProvider
        events={events}
        range={range}
        onRangeChange={setRange}
        anchorDate={anchorDate}
        onAnchorDateChange={setAnchorDate}
        timeZone="UTC"
        className="h-[560px]"
        onCreate={(value) =>
          setEvents((current) => [
            ...current,
            { ...value, id: crypto.randomUUID(), name: "New event" },
          ])
        }
        onEventChange={({ id, reason: _reason, ...value }) =>
          setEvents((current) =>
            current.map((event) =>
              event.id === id ? { ...event, ...value } : event,
            ),
          )
        }
      >
        <CalendarHeaderToolbar />
        <CalendarContent />
      </CalendarProvider>
      <p className="mt-2 text-sm text-secondary" aria-live="polite">
        Viewing{" "}
        {new Intl.DateTimeFormat("en", {
          timeZone: "UTC",
          dateStyle: "medium",
        }).format(anchorDate)}{" "}
        ({range}, UTC).
      </p>
    </div>
  );
}
