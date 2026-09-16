"use client";

import { useState } from "react";

import { Icon } from "@notion-kit/icons";
import {
  CalendarContent,
  CalendarEvent,
  CalendarHeaderToolbar,
  CalendarProvider,
  type CalendarEventData,
  type CalendarEventRenderProps,
} from "@notion-kit/ui/calendar";

function EventCard({ event, segment }: CalendarEventRenderProps) {
  return (
    <CalendarEvent.Root event={event} segment={segment}>
      <CalendarEvent.Item>
        <span className="flex items-center gap-1">
          {event.allDay ? (
            <Icon.ViewCalendar className="size-3 shrink-0" />
          ) : (
            <Icon.Clock className="size-3 shrink-0" />
          )}
          <span className="truncate">{event.name}</span>
        </span>
      </CalendarEvent.Item>
      <CalendarEvent.Resize edge="start" />
      <CalendarEvent.Resize edge="end" />
    </CalendarEvent.Root>
  );
}

export default function CalendarCustomEvents() {
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
        name: "Product launch",
        startAt: day,
        endAt: null,
        allDay: true,
      },
      {
        id: "review",
        name: "Design review",
        startAt: day + 10 * 60 * 60 * 1000,
        endAt: day + 11 * 60 * 60 * 1000,
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
        className="h-[560px]"
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
        <CalendarContent renderEvent={EventCard} />
      </CalendarProvider>
      <p className="mt-2 text-sm text-secondary" aria-live="polite">
        {opened
          ? `Opened: ${opened}`
          : "Times are in UTC. Custom cards keep event opening, dragging, and resizing."}
      </p>
    </div>
  );
}
