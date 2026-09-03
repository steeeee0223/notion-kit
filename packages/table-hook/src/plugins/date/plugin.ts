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

import type { ComparableValue, FilterEvaluationContext } from "../types";
import { createCompareFn, genericCounting } from "../utils";
import type {
  CreatedTimePlugin,
  DateConfig,
  DateData,
  DatePlugin,
  LastEditedTimePlugin,
} from "./types";
import {
  dateDayKey,
  formatDateRangeDuration,
  isValidDateTimestamp,
  relativeDateDayKey,
  toDateString,
  type RelativeDateOperand,
} from "./utils";

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

function dateCapabilities<Data>(
  extract: DateExtractor<Data>,
  isEmpty: (data: Data) => boolean,
) {
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
  const pointOperand = (operand: unknown) => {
    if (typeof operand !== "object" || operand === null) return null;
    const timestamp = (operand as { timestamp?: unknown }).timestamp;
    return isValidDateTimestamp(timestamp) ? timestamp : null;
  };
  const comparisonValue = (
    timestamp: number,
    includeTime: boolean | undefined,
    config: DateConfig,
  ) => {
    if (!isValidDateTimestamp(timestamp)) return null;
    return includeTime ? timestamp : dateDayKey(timestamp, config.tz ?? "UTC");
  };
  const comparisonOperator = (
    id: string,
    name: string,
    predicate: (value: number | string, operand: number | string) => boolean,
  ) => ({
    id,
    name,
    operand: { kind: "date" as const },
    matches: (
      data: Data | undefined,
      row: Row,
      config: DateConfig,
      operand?: unknown,
    ) => {
      const value = extract(data, row);
      const timestamp = pointOperand(operand);
      if (value.start === undefined || timestamp === null) return false;
      const comparableValue = comparisonValue(
        value.start,
        value.includeTime,
        config,
      );
      const comparableOperand = comparisonValue(
        timestamp,
        value.includeTime,
        config,
      );
      return (
        comparableValue !== null &&
        comparableOperand !== null &&
        predicate(comparableValue, comparableOperand)
      );
    },
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
    filtering: {
      operators: [
        comparisonOperator(
          "equals",
          "Equals",
          (value, operand) => value === operand,
        ),
        comparisonOperator(
          "before",
          "Before",
          (value, operand) => value < operand,
        ),
        comparisonOperator(
          "after",
          "After",
          (value, operand) => value > operand,
        ),
        comparisonOperator(
          "on-or-before",
          "On or before",
          (value, operand) => value <= operand,
        ),
        comparisonOperator(
          "on-or-after",
          "On or after",
          (value, operand) => value >= operand,
        ),
        {
          id: "between",
          name: "Between",
          operand: { kind: "date-range" as const },
          matches: (
            data: Data | undefined,
            row: Row,
            config: DateConfig,
            operand?: unknown,
          ) => {
            if (typeof operand !== "object" || operand === null) return false;
            const { start, end } = operand as {
              start?: unknown;
              end?: unknown;
            };
            if (
              typeof start !== "number" ||
              !isValidDateTimestamp(start) ||
              typeof end !== "number" ||
              !isValidDateTimestamp(end) ||
              start > end
            )
              return false;
            const value = extract(data, row);
            if (value.start === undefined) return false;
            const comparable = comparisonValue(
              value.start,
              value.includeTime,
              config,
            );
            const comparableStart = comparisonValue(
              start,
              value.includeTime,
              config,
            );
            const comparableEnd = comparisonValue(
              end,
              value.includeTime,
              config,
            );
            return (
              comparable !== null &&
              comparableStart !== null &&
              comparableEnd !== null &&
              comparable >= comparableStart &&
              comparable <= comparableEnd
            );
          },
        },
        {
          id: "is-empty",
          name: "Is empty",
          operand: { kind: "none" as const },
          matches: (data: Data) => isEmpty(data),
        },
        {
          id: "is-not-empty",
          name: "Is not empty",
          operand: { kind: "none" as const },
          matches: (data: Data) => !isEmpty(data),
        },
        {
          id: "relative-to-today",
          name: "Relative to today",
          operand: { kind: "relative-date" as const },
          matches: (
            data: Data | undefined,
            row: Row,
            config: DateConfig,
            operand: unknown,
            context: FilterEvaluationContext,
          ) => {
            if (typeof operand !== "object" || operand === null) return false;
            const amount = (operand as { amount?: unknown }).amount;
            const unit = (operand as { unit?: unknown }).unit;
            if (
              typeof amount !== "number" ||
              !Number.isSafeInteger(amount) ||
              (unit !== "day" &&
                unit !== "week" &&
                unit !== "month" &&
                unit !== "year") ||
              !isValidDateTimestamp(context.now)
            )
              return false;
            const relativeOperand: RelativeDateOperand = { amount, unit };
            const value = extract(data, row);
            if (value.start === undefined) return false;
            const timeZone = config.tz ?? "UTC";
            const valueKey = dateDayKey(value.start, timeZone);
            const relativeKey = relativeDateDayKey(
              context.now,
              relativeOperand,
              timeZone,
            );
            return (
              valueKey !== null &&
              relativeKey !== null &&
              valueKey === relativeKey
            );
          },
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

export function date(): DatePlugin {
  const id = "date";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isEmpty = (data: DateData) => data.start === undefined;
  return {
    id,
    default: {
      data: {},
      config: { dateFormat: "full", timeFormat: "24-hour", tz },
    },
    fromValue: () => ({}),
    toValue: (data) => data.start ?? null,
    isEmpty,
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
    ...dateCapabilities(extractDateValue, isEmpty),
    counting: withDateCalculations(genericCounting(isEmpty), extractDateValue),
  };
}

export function createdTime(): CreatedTimePlugin {
  const id = "created-time";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isEmpty = () => false;
  return {
    id,
    default: {
      data: null,
      config: { dateFormat: "full", timeFormat: "24-hour", tz },
    },
    fromValue: () => null,
    toValue: (_, row) => row.createdAt,
    isEmpty,
    toTextValue: (_, row) =>
      toDateString(
        { start: row.createdAt, includeTime: true },
        { dateFormat: "full", timeFormat: "24-hour", tz },
      ),
    toGroupValue: (_, row) => trimTs(row.createdAt, "date"),
    compare: (rowA, rowB) => compareNumbers(rowA.createdAt, rowB.createdAt),
    ...dateCapabilities(extractCreatedTime, isEmpty),
    counting: withDateCalculations(
      genericCounting(isEmpty),
      extractCreatedTime,
      true,
    ),
  };
}

export function lastEditedTime(): LastEditedTimePlugin {
  const id = "last-edited-time";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isEmpty = () => false;
  return {
    id,
    default: {
      data: null,
      config: { dateFormat: "full", timeFormat: "24-hour", tz },
    },
    fromValue: () => null,
    toValue: (_, row) => row.lastEditedAt,
    isEmpty,
    toTextValue: (_, row) =>
      toDateString(
        { start: row.lastEditedAt, includeTime: true },
        { dateFormat: "full", timeFormat: "24-hour", tz },
      ),
    toGroupValue: (_, row) => trimTs(row.lastEditedAt, "date"),
    compare: (rowA, rowB) =>
      compareNumbers(rowA.lastEditedAt, rowB.lastEditedAt),
    ...dateCapabilities(extractLastEditedTime, isEmpty),
    counting: withDateCalculations(
      genericCounting(isEmpty),
      extractLastEditedTime,
      true,
    ),
  };
}
