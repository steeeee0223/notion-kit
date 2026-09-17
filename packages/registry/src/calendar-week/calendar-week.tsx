"use client";

import { useState } from "react";

import {
  CalendarContent,
  CalendarHeaderToolbar,
  CalendarProvider,
  type CalendarEventData,
} from "@notion-kit/ui/calendar";

export default function CalendarWeek() {
  const [events, setEvents] = useState<CalendarEventData[]>(() => {
    const now = new Date();
    const at = (dayOffset: number, hour = 0) =>
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + dayOffset,
        hour,
      );
    return [
      {
        id: "launch",
        name: "Launch week",
        startAt: at(-1),
        endAt: at(2),
        allDay: true,
      },
      {
        id: "review",
        name: "Design review",
        startAt: at(0, 10),
        endAt: at(0, 12),
        allDay: false,
      },
      {
        id: "planning",
        name: "Sprint planning",
        startAt: at(0, 11),
        endAt: at(0, 13),
        allDay: false,
      },
      {
        id: "release",
        name: "Overnight release",
        startAt: at(0, 23),
        endAt: at(1, 1),
        allDay: false,
      },
    ];
  });

  return (
    <div className="w-full min-w-0">
      <CalendarProvider
        events={events}
        defaultRange="weekly"
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
      <p className="mt-2 text-sm text-secondary">
        Times are in UTC. Select an empty slot to create an event. Drag events
        between the all-day area and time grid to convert them.
      </p>
    </div>
  );
}
