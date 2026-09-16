import type { TableViewState } from "@notion-kit/table-view";
import type { CalendarEventData } from "@notion-kit/ui/calendar";

import { createTableViewFixture } from "./table-view";

export const CALENDAR_ANCHOR = Date.parse("2026-09-16T12:00:00Z");

export function createCalendarEvents(): CalendarEventData[] {
  return [
    {
      id: "sprint",
      name: "Project sprint",
      startAt: Date.parse("2026-09-11T00:00Z"),
      endAt: Date.parse("2026-09-16T00:00Z"),
      allDay: true,
    },
    {
      id: "milestone",
      name: "Release milestone",
      startAt: Date.parse("2026-09-16T00:00Z"),
      endAt: null,
      allDay: true,
    },
    {
      id: "meeting",
      name: "Design review",
      startAt: Date.parse("2026-09-16T09:00Z"),
      endAt: Date.parse("2026-09-16T10:00Z"),
      allDay: false,
    },
    {
      id: "overlap",
      name: "Review follow-up",
      startAt: Date.parse("2026-09-16T09:30Z"),
      endAt: Date.parse("2026-09-16T11:00Z"),
      allDay: false,
    },
    {
      id: "open-end",
      name: "Focus time",
      startAt: Date.parse("2026-09-17T14:00Z"),
      endAt: null,
      allDay: false,
    },
    {
      id: "overnight",
      name: "Night deploy",
      startAt: Date.parse("2026-09-16T23:00Z"),
      endAt: Date.parse("2026-09-17T01:00Z"),
      allDay: false,
    },
  ];
}

export function createDstCalendarEvents(): CalendarEventData[] {
  return [
    {
      id: "dst-first",
      name: "First 01:15",
      startAt: Date.parse("2026-11-01T05:15Z"),
      endAt: Date.parse("2026-11-01T05:45Z"),
      allDay: false,
    },
    {
      id: "dst-second",
      name: "Second 01:15",
      startAt: Date.parse("2026-11-01T06:15Z"),
      endAt: Date.parse("2026-11-01T06:45Z"),
      allDay: false,
    },
  ];
}

export function createCalendarTableScenario() {
  const fixture = createTableViewFixture();
  const template = fixture.data[0]!;
  const view: TableViewState = {
    ...fixture.view,
    layout: "calendar",
    dateView: { range: "monthly", datePropertyId: "due" },
  };
  const data = createCalendarEvents().map((event) => ({
    ...template,
    id: event.id,
    properties: {
      ...Object.fromEntries(
        Object.entries(template.properties).map(([id, cell]) => [
          id,
          { ...structuredClone(cell), id: `${event.id}-${id}` },
        ]),
      ),
      title: { id: `${event.id}-title`, value: event.name },
      due: {
        id: `${event.id}-due`,
        value: {
          start: event.startAt,
          end:
            event.endAt === null
              ? undefined
              : event.allDay
                ? event.endAt - 86_400_000
                : event.endAt,
          endDate: event.endAt !== null,
          includeTime: !event.allDay,
        },
      },
    },
  }));
  return { data, properties: fixture.properties, view };
}
