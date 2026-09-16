"use client";

import { useState } from "react";

import {
  TableView,
  type ColumnDefs,
  type PartialTableViewState,
  type Row,
} from "@notion-kit/table-view";

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
    return ["Design review", "Release"].map((name, index) => ({
      id: `event-${index}`,
      createdAt: start,
      lastEditedAt: start,
      properties: {
        title: { id: `title-${index}`, value: name },
        date: {
          id: `date-${index}`,
          value: {
            start: start + index * 86400000,
            end: start + (index + 1) * 86400000,
            endDate: true,
            includeTime: false,
          },
        },
      },
    }));
  });
  return (
    <div className="w-full min-w-0">
      <p className="mb-3 text-sm text-secondary">
        Use Layout in the view settings to switch between Calendar and Timeline.
      </p>
      <TableView
        defaultProperties={properties}
        defaultData={data}
        view={view}
        onViewChange={({ next }) => setView(next)}
      />
    </div>
  );
}
