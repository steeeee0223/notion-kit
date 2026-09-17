"use client";

import { useState } from "react";

import type { DateData } from "@notion-kit/table-hook/plugins";
import {
  TableView,
  type ColumnDefs,
  type PartialTableViewState,
  type Row,
} from "@notion-kit/table-view";
import { createMockEditLogApi } from "@notion-kit/table-view/mock";

const properties: ColumnDefs = [
  {
    id: "title",
    name: "Name",
    type: "title",
    width: "220",
    config: { showIcon: true },
  },
  {
    id: "date",
    name: "Schedule",
    type: "date",
    width: "160",
    config: { dateFormat: "full", timeFormat: "24-hour", tz: "UTC" },
  },
];

export default function TableViewCalendar() {
  const [view, setView] = useState<PartialTableViewState>({
    layout: "calendar",
    dateView: { range: "monthly", datePropertyId: "date" },
  });
  const [data] = useState<Row[]>(() => {
    const now = new Date();
    const start = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    );
    const hour = 60 * 60 * 1000;
    const day = 24 * hour;
    const scheduled: { name: string; date: DateData }[] = [
      {
        name: "Launch week",
        // Table Date values include the end day for all-day events.
        date: {
          start: start - day,
          end: start + day,
          endDate: true,
          includeTime: false,
        },
      },
      {
        name: "Design review",
        date: {
          start: start + 10 * hour,
          end: start + 12 * hour,
          endDate: true,
          includeTime: true,
        },
      },
      {
        name: "Sprint planning",
        date: {
          start: start + 11 * hour,
          end: start + 13 * hour,
          endDate: true,
          includeTime: true,
        },
      },
      {
        name: "Write release notes",
        date: { start, endDate: false, includeTime: false },
      },
      { name: "Unscheduled task", date: {} },
    ];
    return scheduled.map(({ name, date }, index) => ({
      id: `event-${index}`,
      createdAt: start,
      lastEditedAt: start,
      properties: {
        title: { id: `title-${index}`, value: name },
        date: {
          id: `date-${index}`,
          value: date,
        },
      },
    }));
  });
  const [editLogs] = useState(() => createMockEditLogApi({ data, properties }));

  return (
    <div className="w-full min-w-0">
      <p className="mb-3 text-sm text-secondary">
        Times are in UTC. Choose Week or Day to see timed events. Use Layout in
        the view settings to switch to Timeline or Table, where the unscheduled
        task is also visible. Edit logs show static sample history; new edits do
        not add log entries.
      </p>
      <TableView
        {...editLogs}
        defaultProperties={properties}
        defaultData={data}
        view={view}
        onViewChange={({ next }) => setView(next)}
      />
    </div>
  );
}
