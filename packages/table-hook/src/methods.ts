import type {
  AggregationContext,
  AggregationFnDef,
  SortFn,
} from "@tanstack/table-core";

import type {
  _RowInstance,
  _TableInstance,
  AnyTableFeatures,
} from "@/features/types";
import {
  aggregateCountAll,
  aggregateCountEmpty,
  aggregateCountNonEmpty,
  aggregateCountUnique,
  aggregateCountValues,
  compareBooleans as compareBooleanValues,
  compareNumbers as compareNumberValues,
  compareStrings as compareStringValues,
  groupByValue as toGroupingValue,
  groupByTextValue as toTextGroupingValue,
} from "@/fns";
import type { Row } from "@/lib/types";
import type { CellPlugin, ComparableValue, CompareFn } from "@/plugins/types";

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type NativeSortFnName = "checkbox" | "number" | "text";

export interface PluginMethodContext<Config = unknown> {
  table: _TableInstance;
  colId: string;
  config: Config;
  weekStartsOn: Weekday;
}

export enum CountMethod {
  NONE = "none",
  ALL = "all",
  VALUES = "values",
  UNIQUE = "unique",
  EMPTY = "empty",
  NONEMPTY = "nonempty",
  CHECKED = "checked",
  UNCHECKED = "unchecked",
  PERCENTAGE_CHECKED = "percentage-checked",
  PERCENTAGE_UNCHECKED = "percentage-unchecked",
  PERCENTAGE_EMPTY = "percentage-empty",
  PERCENTAGE_NONEMPTY = "percentage-nonempty",
}

export interface SortingMethod<Data = unknown, Config = unknown> {
  id: string;
  name: string;
  ascendingLabel: string;
  descendingLabel: string;
  toComparable?: (
    data: Data,
    row: Row,
    context: PluginMethodContext<Config>,
  ) => ComparableValue;
  compare?: CompareFn<ComparableValue>;
  sortFn?: NativeSortFnName | SortFn<AnyTableFeatures, Row>;
  function?: (rowA: Row, rowB: Row, colId: string) => number;
}

export interface LegacySortingMethod {
  id: string;
  name: string;
  /** @deprecated Prefer `toComparable` plus `compare` for reusable sorting. */
  function: (rowA: Row, rowB: Row, colId: string) => number;
}

export type SortingMethodDescriptor<Data = unknown, Config = unknown> =
  | SortingMethod<Data, Config>
  | LegacySortingMethod;

export interface GroupingMethod<Data = unknown, Config = unknown> {
  id: string;
  name: string;
  function: (
    data: Data,
    row: Row,
    colId: string,
    context: PluginMethodContext<Config>,
  ) => ComparableValue;
  toSortValue?: (
    groupValue: ComparableValue,
    context: PluginMethodContext<Config>,
  ) => ComparableValue;
}

export interface CountingMethodContext {
  table: _TableInstance;
  rows: _RowInstance[];
  colId: string;
  plugin: CellPlugin;
  isCapped?: boolean;
}

export interface CountingMethod {
  id: string;
  name: string;
  label?: string;
  hint?: { description: string; imageSrc?: string };
  /** Preferred TanStack aggregation reference for new methods. */
  aggregationFn?:
    | string
    | AggregationFnDef<AnyTableFeatures, Row, unknown, unknown>;
  /** Plugin-owned extraction used before a reusable aggregation executes. */
  toAggregationValue?: (data: unknown, row: Row) => unknown;
  /** Formats a semantic aggregation result for the footer. */
  formatResult?: (result: unknown, context: CountingMethodContext) => string;
  /** Legacy formatted calculation callback. */
  function?: (context: CountingMethodContext) => string;
}

export interface CountingMethodGroup {
  group: string;
  functions: CountingMethod[];
}

export type ResolvedSortingMethod<
  Data = unknown,
  Config = unknown,
> = SortingMethodDescriptor<Data, Config> & {
  function: (rowA: Row, rowB: Row, colId: string) => number;
};

export type ResolvedGroupingMethod<
  Data = unknown,
  Config = unknown,
> = GroupingMethod<Data, Config>;

export function isValueSortingMethod<Data = unknown, Config = unknown>(
  method: SortingMethodDescriptor<Data, Config>,
): method is SortingMethod<Data, Config> & {
  toComparable: NonNullable<SortingMethod<Data, Config>["toComparable"]>;
  compare: NonNullable<SortingMethod<Data, Config>["compare"]>;
} {
  return (
    "toComparable" in method &&
    typeof method.toComparable === "function" &&
    "compare" in method &&
    typeof method.compare === "function"
  );
}

function capValue(num: number, capped?: boolean) {
  return capped && num > 99 ? "99+" : num.toString();
}

function getPercentage(a: number, b: number) {
  if (b === 0) return "0.0%";
  return ((a * 100) / b).toFixed(1) + "%";
}

function getCellData(row: Row, colId: string): unknown {
  const value: unknown = row.properties[colId]?.value;
  return value;
}

function createNullableCompareFn<T extends ComparableValue>(
  compare: CompareFn<T>,
): CompareFn<T> {
  return (a, b) => {
    if (a === null || typeof a === "undefined")
      return b === null || typeof b === "undefined" ? 0 : -1;
    if (b === null || typeof b === "undefined") return 1;
    return compare(a as T, b as T);
  };
}

export const compareStrings: CompareFn<ComparableValue> = (a, b) =>
  compareStringValues(String(a), String(b));

export const compareNumbers: CompareFn<ComparableValue> = (a, b) =>
  compareNumberValues(Number(a), Number(b));

export const compareBooleans: CompareFn<ComparableValue> = (a, b) =>
  compareBooleanValues(Boolean(a), Boolean(b));

export function createSortingMethod<Data extends ComparableValue>(
  id: string,
  name: string,
  compare: CompareFn<ComparableValue>,
): SortingMethod<Data> {
  const compareValues = createNullableCompareFn(compare);

  return {
    id,
    name,
    ascendingLabel: "Ascending",
    descendingLabel: "Descending",
    toComparable: (data) => data,
    compare,
    function: (rowA, rowB, colId) => {
      const dataA = getCellData(rowA, colId);
      const dataB = getCellData(rowB, colId);
      return compareValues(dataA as Data, dataB as Data);
    },
  };
}

export const sortByText = createSortingMethod("text", "Text", compareStrings);

export const sortByNumber = createSortingMethod(
  "number",
  "Number",
  compareNumbers,
);

export const sortByCheckbox = createSortingMethod(
  "checkbox",
  "Checkbox",
  compareBooleans,
);

export const groupByValue: GroupingMethod = {
  id: "value",
  name: "Value",
  function: (data) => toGroupingValue(data),
};

export const groupByTextValue: GroupingMethod = {
  id: "text",
  name: "Text",
  function: (data) => toTextGroupingValue(data),
};

export const countAll: CountingMethod = {
  id: CountMethod.ALL,
  name: "All",
  aggregationFn: "countAll",
  formatResult: (result, { isCapped }) => capValue(Number(result), isCapped),
};

export const countValues: CountingMethod = {
  id: CountMethod.VALUES,
  name: "Values",
  aggregationFn: aggregateCountValues,
  formatResult: (result, { isCapped }) => capValue(Number(result), isCapped),
};

export const countUnique: CountingMethod = {
  id: CountMethod.UNIQUE,
  name: "Unique",
  aggregationFn: aggregateCountUnique,
  formatResult: (result, { isCapped }) => capValue(Number(result), isCapped),
};

export const countEmpty: CountingMethod = {
  id: CountMethod.EMPTY,
  name: "Empty",
  aggregationFn: aggregateCountEmpty,
  formatResult: (result, { isCapped }) => capValue(Number(result), isCapped),
};

export const countNonEmpty: CountingMethod = {
  id: CountMethod.NONEMPTY,
  name: "Not empty",
  aggregationFn: aggregateCountNonEmpty,
  formatResult: (result, { isCapped }) => capValue(Number(result), isCapped),
};

export const countChecked: CountingMethod = {
  id: CountMethod.CHECKED,
  name: "Checked",
  aggregationFn: aggregateCountNonEmpty,
  formatResult: countNonEmpty.formatResult,
};

export const countUnchecked: CountingMethod = {
  id: CountMethod.UNCHECKED,
  name: "Unchecked",
  aggregationFn: aggregateCountEmpty,
  formatResult: countEmpty.formatResult,
};

export const percentageChecked: CountingMethod = {
  id: CountMethod.PERCENTAGE_CHECKED,
  name: "Checked",
  aggregationFn: aggregateCountNonEmpty,
  formatResult: (result, { rows }) =>
    getPercentage(Number(result), rows.length),
};

export const percentageUnchecked: CountingMethod = {
  id: CountMethod.PERCENTAGE_UNCHECKED,
  name: "Unchecked",
  aggregationFn: aggregateCountEmpty,
  formatResult: (result, { rows }) =>
    getPercentage(Number(result), rows.length),
};

export const percentageEmpty: CountingMethod = {
  id: CountMethod.PERCENTAGE_EMPTY,
  name: "Empty",
  aggregationFn: aggregateCountEmpty,
  formatResult: percentageUnchecked.formatResult,
};

export const percentageNonEmpty: CountingMethod = {
  id: CountMethod.PERCENTAGE_NONEMPTY,
  name: "Not empty",
  aggregationFn: aggregateCountNonEmpty,
  formatResult: percentageChecked.formatResult,
};

function resolveRegisteredMethod<T extends { id: string }>(
  methods: T[],
  selectedMethodId: string | undefined,
  defaultMethodId: string | undefined,
) {
  return (
    methods.find((method) => method.id === selectedMethodId) ??
    methods.find((method) => method.id === defaultMethodId) ??
    methods[0]
  );
}

function createPluginMethodContext<Key extends string, Data, Config>(
  plugin: CellPlugin<Key, Data, Config>,
  colId: string,
  context?: Partial<Omit<PluginMethodContext<Config>, "colId">>,
): PluginMethodContext<Config> {
  return {
    table: context?.table ?? ({} as _TableInstance),
    colId,
    config: context?.config ?? plugin.default.config,
    weekStartsOn: context?.weekStartsOn ?? 1,
  };
}

function createValueComparatorRowFunction<Key extends string, Data, Config>(
  plugin: CellPlugin<Key, Data, Config>,
  method: SortingMethod<Data, Config> & {
    toComparable: NonNullable<SortingMethod<Data, Config>["toComparable"]>;
    compare: NonNullable<SortingMethod<Data, Config>["compare"]>;
  },
  context?: Partial<Omit<PluginMethodContext<Config>, "colId">>,
) {
  const compareValues = createNullableCompareFn(method.compare);

  return (rowA: Row, rowB: Row, colId: string) => {
    const methodContext = createPluginMethodContext(plugin, colId, context);
    const dataA: unknown = rowA.properties[colId]?.value ?? null;
    const dataB: unknown = rowB.properties[colId]?.value ?? null;
    const valueA = method.toComparable(dataA as Data, rowA, methodContext);
    const valueB = method.toComparable(dataB as Data, rowB, methodContext);
    return compareValues(valueA, valueB);
  };
}

export function resolveSortingMethod<Key extends string, Data, Config>(
  plugin: CellPlugin<Key, Data, Config>,
  selectedMethodId?: string,
  context?: Partial<Omit<PluginMethodContext<Config>, "colId">>,
): ResolvedSortingMethod<Data, Config> | undefined {
  const methods = plugin.sorting?.methods ?? [];
  const method = resolveRegisteredMethod(
    methods,
    selectedMethodId,
    plugin.sorting?.defaultMethod,
  );

  if (method) {
    return {
      ...method,
      function:
        method.function ??
        (isValueSortingMethod(method)
          ? createValueComparatorRowFunction(plugin, method, context)
          : () => 0),
    };
  }
  if (!plugin.compare) return undefined;

  return {
    id: "legacy",
    name: "Legacy",
    function: plugin.compare,
  };
}

export function resolveSortingFn<Key extends string, Data, Config>(
  plugin: CellPlugin<Key, Data, Config>,
  selectedMethodId?: string,
  context?: Partial<Omit<PluginMethodContext<Config>, "colId">>,
): NativeSortFnName | SortFn<AnyTableFeatures, Row> | undefined {
  const methods = plugin.sorting?.methods ?? [];
  const method = resolveRegisteredMethod(
    methods,
    selectedMethodId,
    plugin.sorting?.defaultMethod,
  );
  if (method && "sortFn" in method && method.sortFn) return method.sortFn;

  const resolved = resolveSortingMethod(plugin, selectedMethodId, context);
  if (!resolved) return undefined;
  return (rowA, rowB, colId) =>
    resolved.function(rowA.original, rowB.original, colId);
}

export function resolveSortingAccessorValue<Key extends string, Data, Config>(
  plugin: CellPlugin<Key, Data, Config>,
  data: Data,
  row: Row,
  colId: string,
  selectedMethodId?: string,
  context?: Partial<Omit<PluginMethodContext<Config>, "colId">>,
) {
  const method = resolveRegisteredMethod(
    plugin.sorting?.methods ?? [],
    selectedMethodId,
    plugin.sorting?.defaultMethod,
  );
  if (method && isValueSortingMethod(method)) {
    return method.toComparable(
      data,
      row,
      createPluginMethodContext(plugin, colId, context),
    );
  }
  return plugin.toValue(data, row);
}

export function getGroupSortableSortingMethods<
  Key extends string,
  Data,
  Config,
>(plugin: CellPlugin<Key, Data, Config>) {
  if (plugin.sorting?.enableGroupSort === false) return [];
  return (plugin.sorting?.methods ?? []).filter(isValueSortingMethod);
}

export function resolveGroupSortingMethod<Key extends string, Data, Config>(
  plugin: CellPlugin<Key, Data, Config>,
  selectedMethodId?: string,
  context?: Partial<Omit<PluginMethodContext<Config>, "colId">>,
) {
  if (plugin.sorting?.enableGroupSort === false) return undefined;
  const method = resolveSortingMethod(plugin, selectedMethodId, context);
  return method && isValueSortingMethod(method) ? method : undefined;
}

export function resolveGroupingMethod<Key extends string, Data, Config>(
  plugin: CellPlugin<Key, Data, Config>,
  selectedMethodId?: string,
): ResolvedGroupingMethod<Data, Config> {
  const methods = plugin.grouping?.methods ?? [];
  const method = resolveRegisteredMethod(
    methods,
    selectedMethodId,
    plugin.grouping?.defaultMethod,
  );

  if (method) return method;

  return {
    id: "legacy",
    name: "Legacy",
    function: (data: unknown, row: Row) =>
      (plugin.toGroupValue ?? plugin.toValue)(data as Data, row),
  };
}

export function resolveCountingMethod(plugin: CellPlugin, methodId: string) {
  return plugin.counting
    ?.flatMap((group) => group.functions)
    .find((method) => method.id === methodId);
}

export const COMMON_AGGREGATION_FNS = {
  countAll: aggregateCountAll,
  countEmpty: aggregateCountEmpty,
  countNonEmpty: aggregateCountNonEmpty,
  countUnique: aggregateCountUnique,
  countValues: aggregateCountValues,
} as const;

// Named references deliberately resolve only against this fixed built-in map.
// Runtime plugins use inline definitions, so they never mutate or override
// DEFAULT_FEATURES and built-in collisions remain deterministic.

export function createCountingAggregation(
  plugin: CellPlugin,
): AggregationFnDef<AnyTableFeatures, Row, unknown, unknown> {
  return {
    aggregate: (
      context: AggregationContext<AnyTableFeatures, Row, unknown>,
    ) => {
      const methodId = context.table.getColumnCounting(context.columnId).method;
      const method = resolveCountingMethod(plugin, methodId);
      const reference = method?.aggregationFn;
      const aggregation =
        typeof reference === "string"
          ? COMMON_AGGREGATION_FNS[
              reference as keyof typeof COMMON_AGGREGATION_FNS
            ]
          : reference;
      const result: unknown = aggregation?.aggregate({
        ...context,
        getValue: (row: _RowInstance) => {
          const value: unknown =
            row.original.properties[context.columnId]?.value;
          return method?.toAggregationValue
            ? method.toAggregationValue(value, row.original)
            : plugin.toValue(value, row.original);
        },
      });
      return result;
    },
  };
}
