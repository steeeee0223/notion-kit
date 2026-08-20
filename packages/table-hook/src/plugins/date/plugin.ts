import { trimTs } from "@notion-kit/utils";

import {
  aggregateDateEarliest,
  aggregateDateLatest,
  aggregateDateRange,
  compareNumbers,
  dateGroupSortValue,
  groupByDateDay,
  groupByDateMonth,
  groupByDateRelative,
  groupByDateWeek,
  groupByDateYear,
} from "@/fns";
import type { Row } from "@/lib/types";
import type { CountingMethod, CountingMethodGroup } from "@/methods";

import type {
  CellValueProps,
  ComparableValue,
  PluginFactoryConfig,
} from "../types";
import { createCompareFn, genericCounting } from "../utils";
import type {
  CreatedTimePlugin,
  DateConfig,
  DateData,
  DatePlugin,
  LastEditedTimePlugin,
} from "./types";
import { formatDateRangeDuration, toDateString } from "./utils";

export type DatePluginConfig = PluginFactoryConfig<DatePlugin>;

interface DerivedTimePluginConfig {
  icon: React.ReactNode;
  defaultIcon?: React.ReactNode;
  renderCellValue: (
    props: CellValueProps<DateData, DateConfig>,
  ) => React.ReactNode;
  renderConfigMenu?: DatePlugin["renderConfigMenu"];
  renderGroupingValue?: DatePlugin["renderGroupingValue"];
}

export type CreatedTimePluginConfig = DerivedTimePluginConfig;
export type LastEditedTimePluginConfig = DerivedTimePluginConfig;

type DateValue = DateData;
type DateExtractor<Data> = (data: Data | undefined, row: Row) => DateValue;

export const extractDateValue: DateExtractor<DateData> = (data) => data ?? {};
export const extractCreatedTime: DateExtractor<null> = (_data, row) => ({
  start: row.createdAt,
  includeTime: true,
});
export const extractLastEditedTime: DateExtractor<null> = (_data, row) => ({
  start: row.lastEditedAt,
  includeTime: true,
});

function dateCapabilities<Data>(extract: DateExtractor<Data>) {
  const grouping =
    (
      function_: (
        value: unknown,
        options: {
          timeZone: string;
          weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
          now: number;
        },
      ) => string | null,
    ) =>
    (
      data: Data,
      row: Row,
      _colId: string,
      context: { config: DateConfig; weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 },
    ) =>
      function_(extract(data, row), {
        timeZone: context.config.tz ?? "UTC",
        weekStartsOn: context.weekStartsOn,
        now: Date.now(),
      });
  const toSortValue = (
    value: ComparableValue,
    context: { config: DateConfig; weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 },
  ) =>
    dateGroupSortValue(value, {
      timeZone: context.config.tz ?? "UTC",
      weekStartsOn: context.weekStartsOn,
      now: Date.now(),
    });
  return {
    sorting: {
      defaultMethod: "date",
      enableGroupSort: true,
      methods: [
        {
          id: "date",
          name: "Date",
          ascendingLabel: "Old → new",
          descendingLabel: "New → old",
          toComparable: (data: Data, row: Row) =>
            extract(data, row).start ?? null,
          compare: (a: ComparableValue, b: ComparableValue) =>
            compareNumbers(Number(a), Number(b)),
        },
      ],
    },
    grouping: {
      defaultMethod: "day",
      methods: [
        {
          id: "relative",
          name: "Relative",
          function: grouping(groupByDateRelative),
          toSortValue,
        },
        {
          id: "day",
          name: "Day",
          function: grouping(groupByDateDay),
          toSortValue,
        },
        {
          id: "week",
          name: "Week",
          function: grouping(groupByDateWeek),
          toSortValue,
        },
        {
          id: "month",
          name: "Month",
          function: grouping(groupByDateMonth),
          toSortValue,
        },
        {
          id: "year",
          name: "Year",
          function: grouping(groupByDateYear),
          toSortValue,
        },
      ],
    },
  };
}

function dateCalculation<Data>(
  id: string,
  name: string,
  aggregationFn: NonNullable<CountingMethod["aggregationFn"]>,
  extract: DateExtractor<Data>,
  includeTime?: boolean,
): CountingMethod {
  return {
    id,
    name,
    aggregationFn,
    toAggregationValue: (data, row) => extract(data as Data, row),
    formatResult: (result, { table, colId }) => {
      if (result === "") return "";
      const config = table.getColumnInfo(colId).config as DateConfig;
      if (id === "date-range") {
        return formatDateRangeDuration(
          {
            ...(result as DateValue),
            includeTime:
              includeTime ?? (result as DateValue).includeTime ?? false,
          },
          config,
        );
      }
      const boundary = result as { value?: number; includeTime?: boolean };
      return toDateString(
        {
          start: boundary.value,
          includeTime: includeTime ?? boundary.includeTime ?? false,
        },
        config,
      );
    },
  };
}

function dateCalculations<Data>(
  extract: DateExtractor<Data>,
  includeTime?: boolean,
): CountingMethod[] {
  return [
    dateCalculation(
      "earliest-date",
      "Earliest date",
      aggregateDateEarliest,
      extract,
      includeTime,
    ),
    dateCalculation(
      "latest-date",
      "Latest date",
      aggregateDateLatest,
      extract,
      includeTime,
    ),
    dateCalculation(
      "date-range",
      "Date range",
      aggregateDateRange,
      extract,
      includeTime,
    ),
  ];
}

export function withDateCalculations<Data>(
  groups: CountingMethodGroup[] = [],
  extract: DateExtractor<Data>,
  includeTime?: boolean,
) {
  return [
    ...groups,
    { group: "Calculate", functions: dateCalculations(extract, includeTime) },
  ];
}

export function date(config: DatePluginConfig): DatePlugin {
  const id = "date";
  const name = "Date";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return {
    id,
    meta: {
      name,
      icon: config.icon,
      desc: "Accepts a date or a date range (time optional). Useful for deadlines, especially with calendar and timeline views.",
    },
    default: {
      name,
      icon: config.defaultIcon ?? config.icon,
      data: {},
      config: { dateFormat: "full", timeFormat: "24-hour", tz },
    },
    fromValue: () => ({}),
    toValue: (data) => data.start ?? null,
    toTextValue: (data) =>
      toDateString(data, { dateFormat: "full", timeFormat: "24-hour", tz }),
    toGroupValue: (data) => {
      if (data.start === undefined) return null;
      return trimTs(data.start, "date");
    },
    compare: createCompareFn<DatePlugin>((a, b) => {
      if (a.start === undefined && b.start === undefined) return 0;
      // undefined sorts after defined values
      if (a.start === undefined) return 1;
      if (b.start === undefined) return -1;
      return compareNumbers(a.start, b.start);
    }),
    ...dateCapabilities(extractDateValue),
    counting: withDateCalculations(genericCounting, extractDateValue),
    renderCellValue: config.renderCellValue,
    renderCellEditor: config.renderCellEditor,
    renderConfigMenu: config.renderConfigMenu,
    renderGroupingValue: config.renderGroupingValue,
  };
}

export function createdTime(
  config: CreatedTimePluginConfig,
): CreatedTimePlugin {
  const id = "created-time";
  const name = "Created time";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return {
    id,
    disableBulkEdit: true,
    meta: {
      name,
      icon: config.icon,
      desc: "Records the timestamp of an item's creation. Auto-generated and not editable.",
    },
    default: {
      name,
      icon: config.defaultIcon ?? config.icon,
      data: null,
      config: { dateFormat: "full", timeFormat: "24-hour", tz },
    },
    fromValue: () => null,
    toValue: (_, row) => row.createdAt,
    toTextValue: (_, row) =>
      toDateString(
        { start: row.createdAt, includeTime: true },
        { dateFormat: "full", timeFormat: "24-hour", tz },
      ),
    toGroupValue: (_, row) => trimTs(row.createdAt, "date"),
    compare: (rowA, rowB) => compareNumbers(rowA.createdAt, rowB.createdAt),
    ...dateCapabilities(extractCreatedTime),
    counting: withDateCalculations(genericCounting, extractCreatedTime, true),
    renderCellValue: ({ row, data: _data, ...props }) =>
      config.renderCellValue({
        data: { start: row.createdAt, includeTime: true },
        row,
        ...props,
      }),
    renderConfigMenu: config.renderConfigMenu,
    renderGroupingValue: config.renderGroupingValue,
  };
}

export function lastEditedTime(
  config: LastEditedTimePluginConfig,
): LastEditedTimePlugin {
  const id = "last-edited-time";
  const name = "Last edited time";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return {
    id,
    disableBulkEdit: true,
    meta: {
      name,
      icon: config.icon,
      desc: "Records the timestamp of an item's last edit. Auto-updated and not editable.",
    },
    default: {
      name,
      icon: config.defaultIcon ?? config.icon,
      data: null,
      config: { dateFormat: "full", timeFormat: "24-hour", tz },
    },
    fromValue: () => null,
    toValue: (_, row) => row.lastEditedAt,
    toTextValue: (_, row) =>
      toDateString(
        { start: row.lastEditedAt, includeTime: true },
        { dateFormat: "full", timeFormat: "24-hour", tz },
      ),
    toGroupValue: (_, row) => trimTs(row.lastEditedAt, "date"),
    compare: (rowA, rowB) =>
      compareNumbers(rowA.lastEditedAt, rowB.lastEditedAt),
    ...dateCapabilities(extractLastEditedTime),
    counting: withDateCalculations(
      genericCounting,
      extractLastEditedTime,
      true,
    ),
    renderCellValue: ({ row, data: _data, ...props }) =>
      config.renderCellValue({
        data: { start: row.lastEditedAt, includeTime: true },
        row,
        ...props,
      }),
    renderConfigMenu: config.renderConfigMenu,
    renderGroupingValue: config.renderGroupingValue,
  };
}
