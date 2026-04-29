import {
  makeStateUpdater,
  type OnChangeFn,
  type Table,
  type TableFeature,
} from "@tanstack/react-table";

import type { TimelineRange } from "@notion-kit/timeline";

import type { Row } from "../lib/types";
import type { DateData } from "../plugins/date/types";

export interface TimelineState {
  range: TimelineRange;
  dateColumnId: string | null;
  sidebarVisible: boolean;
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
  setTimelineRange: (range: TimelineRange) => void;
  toggleSidebar: () => void;
  getTimelineItemRange: (rowId: string) => {
    start: number;
    end: number;
  } | null;
  updateTimelineRange: (rowId: string, start: number, end: number) => void;
}

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
        range: "monthly",
        dateColumnId: null,
        sidebarVisible: false,
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

    table.setTimelineRange = (range) => {
      table.setTimelineState((v) => ({ ...v, range }));
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
