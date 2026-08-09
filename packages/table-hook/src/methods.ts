import type { _RowInstance, _TableInstance } from "@/features/types";
import type { Row } from "@/lib/types";
import type { CellPlugin, ComparableValue, CompareFn } from "@/plugins/types";

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

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
  compare: CompareFn<ComparableValue>;
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
  function: (context: CountingMethodContext) => string;
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

function toComparableString(value: unknown) {
  if (value === null || value === false || typeof value === "undefined") {
    return "";
  }
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
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
  String(a).localeCompare(String(b));

export const compareNumbers: CompareFn<ComparableValue> = (a, b) =>
  Number(a) - Number(b);

export const compareBooleans: CompareFn<ComparableValue> = (a, b) =>
  Number(a) - Number(b);

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
  function: (data) => data as ComparableValue,
};

export const groupByTextValue: GroupingMethod = {
  id: "text",
  name: "Text",
  function: (data) => toComparableString(data),
};

function getTextValue(plugin: CellPlugin, row: Row, colId: string) {
  return toComparableString(plugin.toValue(row.properties[colId]?.value, row));
}

export const countAll: CountingMethod = {
  id: CountMethod.ALL,
  name: "All",
  function: ({ rows, isCapped }) => capValue(rows.length, isCapped),
};

export const countValues: CountingMethod = {
  id: CountMethod.VALUES,
  name: "Values",
  function: ({ rows, colId, plugin, isCapped }) => {
    const count = rows.reduce(
      (acc, row) =>
        acc +
        getTextValue(plugin, row.original, colId)
          .split(",")
          .filter((v) => !!v.trim()).length,
      0,
    );
    return capValue(count, isCapped);
  },
};

export const countUnique: CountingMethod = {
  id: CountMethod.UNIQUE,
  name: "Unique",
  function: ({ rows, colId, plugin, isCapped }) => {
    const values = rows.reduce((acc, row) => {
      const value = getTextValue(plugin, row.original, colId);
      value.split(",").forEach((v) => {
        if (!v.trim()) return;
        acc.add(v);
      });
      return acc;
    }, new Set<string>());

    return capValue(values.size, isCapped);
  },
};

export const countEmpty: CountingMethod = {
  id: CountMethod.EMPTY,
  name: "Empty",
  function: ({ rows, colId, plugin, isCapped }) => {
    const count = rows.reduce(
      (acc, row) =>
        acc + Number(getTextValue(plugin, row.original, colId) === ""),
      0,
    );
    return capValue(count, isCapped);
  },
};

export const countNonEmpty: CountingMethod = {
  id: CountMethod.NONEMPTY,
  name: "Not empty",
  function: ({ rows, colId, plugin, isCapped }) => {
    const count = rows.reduce(
      (acc, row) =>
        acc + Number(getTextValue(plugin, row.original, colId) !== ""),
      0,
    );
    return capValue(count, isCapped);
  },
};

export const countChecked: CountingMethod = {
  id: CountMethod.CHECKED,
  name: "Checked",
  function: countNonEmpty.function,
};

export const countUnchecked: CountingMethod = {
  id: CountMethod.UNCHECKED,
  name: "Unchecked",
  function: countEmpty.function,
};

export const percentageChecked: CountingMethod = {
  id: CountMethod.PERCENTAGE_CHECKED,
  name: "Checked",
  function: ({ rows, colId, plugin }) => {
    const count = rows.reduce(
      (acc, row) =>
        acc + Number(getTextValue(plugin, row.original, colId) !== ""),
      0,
    );
    return getPercentage(count, rows.length);
  },
};

export const percentageUnchecked: CountingMethod = {
  id: CountMethod.PERCENTAGE_UNCHECKED,
  name: "Unchecked",
  function: ({ rows, colId, plugin }) => {
    const count = rows.reduce(
      (acc, row) =>
        acc + Number(getTextValue(plugin, row.original, colId) === ""),
      0,
    );
    return getPercentage(count, rows.length);
  },
};

export const percentageEmpty: CountingMethod = {
  id: CountMethod.PERCENTAGE_EMPTY,
  name: "Empty",
  function: percentageUnchecked.function,
};

export const percentageNonEmpty: CountingMethod = {
  id: CountMethod.PERCENTAGE_NONEMPTY,
  name: "Not empty",
  function: percentageChecked.function,
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
