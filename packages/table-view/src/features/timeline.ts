import {
  makeStateUpdater,
  type OnChangeFn,
  type Table,
  type TableFeature,
} from "@tanstack/react-table";

import type { Row } from "../lib/types";
import type { DateData } from "../plugins/date/types";

export type TimelineUnit =
  | "hours"
  | "day"
  | "week"
  | "bi-week"
  | "month"
  | "quarter"
  | "year"
  | "5-years";

export interface TimelineState {
  unit: TimelineUnit;
  scrollOrigin: number;
  dateColumnId: string | null;
  sidebarVisible: boolean;
  sidebarWidth: number;
}

export interface TimelineTableState {
  timeline: TimelineState;
}

export interface TimelineOptions {
  onTimelineChange?: OnChangeFn<TimelineState>;
}

export interface TimelineTableApi {
  getTimelineState: () => TimelineState;
  setTimelineState: OnChangeFn<TimelineState>;
  setTimelineUnit: (unit: TimelineUnit) => void;
  setTimelineDateColumn: (colId: string | null) => void;
  scrollToToday: () => void;
  scrollToPrev: () => void;
  scrollToNext: () => void;
  toggleSidebar: () => void;
  getTimelineItemRange: (rowId: string) => {
    start: number;
    end: number;
  } | null;
  updateTimelineRange: (rowId: string, start: number, end: number) => void;
}

const UNIT_VIEWPORT_MS: Record<TimelineUnit, number> = {
  hours: 24 * 60 * 60 * 1000,
  day: 7 * 24 * 60 * 60 * 1000,
  week: 4 * 7 * 24 * 60 * 60 * 1000,
  "bi-week": 8 * 7 * 24 * 60 * 60 * 1000,
  month: 3 * 30 * 24 * 60 * 60 * 1000,
  quarter: 12 * 30 * 24 * 60 * 60 * 1000,
  year: 3 * 365 * 24 * 60 * 60 * 1000,
  "5-years": 10 * 365 * 24 * 60 * 60 * 1000,
};

function findDateColumnId(table: Table<Row>): string | null {
  const { columnOrder, columnsInfo } = table.getState();
  for (const colId of columnOrder) {
    const info = columnsInfo[colId];
    if (info?.type === "date") return colId;
  }
  return null;
}

export const TimelineFeature: TableFeature = {
  getInitialState: (state): TimelineTableState => {
    return {
      timeline: {
        unit: "month",
        scrollOrigin: Date.now(),
        dateColumnId: null,
        sidebarVisible: true,
        sidebarWidth: 360,
      },
      ...state,
    };
  },

  getDefaultOptions: (table) => {
    return {
      onTimelineChange: makeStateUpdater("timeline", table),
    };
  },

  createTable: (table: Table<Row>) => {
    table.getTimelineState = () => table.getState().timeline;

    table.setTimelineState = (updater) => {
      table.options.onTimelineChange?.(updater);
      table.options.sync?.("table.setTimelineState");
    };

    table.setTimelineUnit = (unit) => {
      table.setTimelineState((v) => ({ ...v, unit }));
    };

    table.setTimelineDateColumn = (colId) => {
      table.setTimelineState((v) => ({
        ...v,
        dateColumnId: colId,
      }));
    };

    table.scrollToToday = () => {
      table.setTimelineState((v) => ({
        ...v,
        scrollOrigin: Date.now(),
      }));
    };

    table.scrollToPrev = () => {
      table.setTimelineState((v) => {
        const delta = UNIT_VIEWPORT_MS[v.unit];
        return { ...v, scrollOrigin: v.scrollOrigin - delta };
      });
    };

    table.scrollToNext = () => {
      table.setTimelineState((v) => {
        const delta = UNIT_VIEWPORT_MS[v.unit];
        return { ...v, scrollOrigin: v.scrollOrigin + delta };
      });
    };

    table.toggleSidebar = () => {
      table.setTimelineState((v) => ({
        ...v,
        sidebarVisible: !v.sidebarVisible,
      }));
    };

    table.getTimelineItemRange = (rowId) => {
      const { dateColumnId } = table.getTimelineState();
      const resolvedColId = dateColumnId ?? findDateColumnId(table);
      if (!resolvedColId) return null;

      const row = table.getRow(rowId);
      const cell = row.original.properties[resolvedColId];
      if (!cell) return null;

      const data = cell.value as DateData;
      if (data.start === undefined) return null;

      const start = data.start;
      const DAY_MS = 24 * 60 * 60 * 1000;
      const end = data.end ?? start + DAY_MS;

      return { start, end };
    };

    table.updateTimelineRange = (rowId, start, end) => {
      const { locked } = table.getTableGlobalState();
      if (locked) return;

      const { dateColumnId } = table.getTimelineState();
      const resolvedColId = dateColumnId ?? findDateColumnId(table);
      if (!resolvedColId) return;

      table.updateCell(rowId, resolvedColId, (prev) => ({
        ...prev,
        value: {
          ...(prev.value as DateData),
          start,
          end,
          endDate: true,
        },
      }));
    };
  },
};
