"use client";

import { useState } from "react";

import {
  CalendarContent,
  CalendarHeaderToolbar,
  CalendarProvider,
  type CalendarEventData,
  type CalendarRange,
} from "@notion-kit/ui/calendar";

export interface CalendarDemoProps {
  defaultRange?: CalendarRange;
  readOnly?: boolean;
}

export default function CalendarDemo({
  defaultRange = "monthly",
  readOnly = false,
}: CalendarDemoProps) {
  const [events, setEvents] = useState<CalendarEventData[]>(() => {
    const now = new Date();
    const day = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    );
    return [
      {
        id: "launch",
        name: "Launch week",
        startAt: day - 2 * 86400000,
        endAt: day + 2 * 86400000,
        allDay: true,
      },
      {
        id: "review",
        name: "Design review",
        startAt: day + 10 * 3600000,
        endAt: day + 11 * 3600000,
        allDay: false,
      },
      {
        id: "planning",
        name: "Sprint planning",
        startAt: day + 10.5 * 3600000,
        endAt: day + 12 * 3600000,
        allDay: false,
      },
      {
        id: "overnight",
        name: "Overnight release",
        startAt: day + 23 * 3600000,
        endAt: day + 25 * 3600000,
        allDay: false,
      },
      {
        id: "note",
        name: "Write release notes",
        startAt: day,
        endAt: null,
        allDay: true,
      },
    ];
  });
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <div className="w-full min-w-0">
      <CalendarProvider
        events={events}
        defaultRange={defaultRange}
        timeZone="UTC"
        readOnly={readOnly}
        className="h-[560px]"
        onCreate={(value) =>
          setEvents((current) => [
            ...current,
            { ...value, id: crypto.randomUUID(), name: "New event" },
          ])
        }
        onEventClick={(event) => setOpened(event.name)}
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
        {opened
          ? `Opened: ${opened}`
          : readOnly
            ? "Select an event to open it."
            : "Select an event to open it. Select an empty date or time to create one."}
      </p>
    </div>
  );
}
