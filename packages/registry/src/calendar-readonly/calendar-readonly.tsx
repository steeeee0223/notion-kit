"use client";

import { useState } from "react";

import {
  CalendarContent,
  CalendarHeaderToolbar,
  CalendarProvider,
  type CalendarEventData,
} from "@notion-kit/ui/calendar";

export default function CalendarReadonly() {
  const [events] = useState<CalendarEventData[]>(() => {
    const now = new Date();
    const startAt = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      10,
    );
    return [
      {
        id: "review",
        name: "Design review",
        startAt,
        endAt: startAt + 60 * 60 * 1000,
        allDay: false,
      },
    ];
  });
  const [opened, setOpened] = useState<string | null>(null);

  return (
    <div className="w-full min-w-0">
      <CalendarProvider
        events={events}
        defaultRange="weekly"
        timeZone="UTC"
        readOnly
        onEventClick={(event) => setOpened(event.name)}
        className="h-[560px]"
      >
        <CalendarHeaderToolbar />
        <CalendarContent />
      </CalendarProvider>
      <p className="mt-2 text-sm text-secondary" aria-live="polite">
        {opened
          ? `Opened: ${opened}`
          : "Times are in UTC. Browse dates and select an event to open it. Editing is disabled."}
      </p>
    </div>
  );
}
