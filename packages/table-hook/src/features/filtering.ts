import {
  constructRow,
  makeObjectMap,
  skipFirstRun,
  tableMemo,
  type FilterFn,
  type RowData,
  type RowModel,
  type Table,
  type TableFeature,
  type Row as TableRow,
} from "@tanstack/react-table";
import { table_autoResetPageIndex } from "@tanstack/react-table/static-functions";
import { v4 } from "uuid";

import type {
  _TableInstance,
  AnyRowData,
  AnyTableFeatures,
} from "@/features/types";
import type { ColumnInfo, Row } from "@/lib/types";
import type {
  CellPlugin,
  FilterEvaluationContext,
  FilterValue,
} from "@/plugins";

export type { FilterValue } from "@/plugins";

export type FilterLogic = "and" | "or";

export interface FilterRule {
  kind: "rule";
  id: string;
  propertyId: string;
  operator: string;
  value?: FilterValue;
}

export interface FilterGroup {
  kind: "group";
  id: string;
  logic: FilterLogic;
  children: (FilterRule | FilterGroup)[];
}

export type TableFilterState = FilterGroup | null;

export interface AdvancedFilteringTableApi {
  getFilters: () => TableFilterState | undefined;
  setFilters: (filters: TableFilterState) => void;
  clearFilters: () => void;
  validateFilters: (value: unknown) => value is TableFilterState;
}

export interface AdvancedFilteringTableState {
  filterEvaluationTick: number;
}

type FilterNode = FilterGroup | FilterRule;
type FilterNodeUpdater = (node: FilterNode) => FilterNode | null;

function mapFilterNode(
  node: FilterNode,
  nodeId: string,
  update: FilterNodeUpdater,
): FilterNode | null {
  if (node.id === nodeId) return update(node);
  if (node.kind === "rule") return node;

  let changed = false;
  const children: FilterNode[] = [];

  for (const child of node.children) {
    const mappedChild = mapFilterNode(child, nodeId, update);
    if (mappedChild !== child) changed = true;
    if (mappedChild) children.push(mappedChild);
  }

  return changed ? { ...node, children } : node;
}

export function countFilterRules(state: unknown): number {
  if (!validateTableFilterState(state) || state === null) return 0;

  const count = (group: FilterGroup): number =>
    group.children.reduce(
      (total, child) => total + (child.kind === "rule" ? 1 : count(child)),
      0,
    );

  return count(state);
}

export function createFilterRule(
  propertyId: string,
  operator: string,
): FilterRule {
  return { kind: "rule", id: v4(), propertyId, operator };
}

export function createFilterGroup(): FilterGroup {
  return { kind: "group", id: v4(), logic: "and", children: [] };
}

export function appendFilterNode(
  state: TableFilterState | undefined,
  groupId: string,
  node: FilterNode,
): TableFilterState {
  if (!state) {
    return {
      kind: "group",
      id: v4(),
      logic: "and",
      children: [node],
    };
  }

  const updated = mapFilterNode(state, groupId, (current) =>
    current.kind === "group"
      ? { ...current, children: [...current.children, node] }
      : current,
  );
  return updated?.kind === "group" ? updated : null;
}

export function updateFilterNode(
  state: TableFilterState | undefined,
  nodeId: string,
  update: (node: FilterNode) => FilterNode,
): TableFilterState {
  if (!state) return null;
  const updated = mapFilterNode(state, nodeId, update);
  return updated?.kind === "group" ? updated : null;
}

export function removeFilterNode(
  state: TableFilterState | undefined,
  nodeId: string,
): TableFilterState {
  if (!state) return null;
  const updated = mapFilterNode(state, nodeId, () => null);
  if (updated?.kind !== "group" || updated.children.length === 0) return null;
  return updated;
}

function isPlainRecord(value: object) {
  const prototype = Reflect.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOwnDataShape(
  value: object,
  requiredKeys: readonly string[],
  optionalKeys: readonly string[] = [],
) {
  const allowedKeys = new Set([...requiredKeys, ...optionalKeys]);
  const ownKeys = Reflect.ownKeys(value);
  const ownStringKeys = new Set<string>();
  for (const key of ownKeys) {
    if (typeof key !== "string" || !allowedKeys.has(key)) return false;
    const descriptor = Reflect.getOwnPropertyDescriptor(value, key);
    if (descriptor?.enumerable !== true || !("value" in descriptor)) {
      return false;
    }
    ownStringKeys.add(key);
  }
  return requiredKeys.every((key) => ownStringKeys.has(key));
}

function isDensePlainArray(value: unknown): value is unknown[] {
  if (
    !Array.isArray(value) ||
    Reflect.getPrototypeOf(value) !== Array.prototype
  ) {
    return false;
  }
  const keys = Reflect.ownKeys(value);
  if (keys.length !== value.length + 1 || !keys.includes("length"))
    return false;
  for (let index = 0; index < value.length; index += 1) {
    const key = String(index);
    const descriptor = Reflect.getOwnPropertyDescriptor(value, key);
    if (descriptor?.enumerable !== true || !("value" in descriptor)) {
      return false;
    }
  }
  return true;
}

function isJsonFilterValue(
  value: unknown,
  ancestors = new WeakSet<object>(),
): value is FilterValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "object") return false;
  if (ancestors.has(value)) return false;
  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      return (
        isDensePlainArray(value) &&
        value.every((item) => isJsonFilterValue(item, ancestors))
      );
    }
    if (!isPlainRecord(value)) return false;
    const keys = Reflect.ownKeys(value);
    const stringKeys = keys.filter(
      (key): key is string => typeof key === "string",
    );
    if (
      stringKeys.length !== keys.length ||
      !hasOwnDataShape(value, stringKeys)
    ) {
      return false;
    }
    return keys.every((key) => {
      if (typeof key !== "string") return false;
      const descriptor = Reflect.getOwnPropertyDescriptor(value, key);
      return isJsonFilterValue(descriptor?.value, ancestors);
    });
  } finally {
    ancestors.delete(value);
  }
}

function isRule(value: unknown): value is FilterRule {
  if (
    typeof value !== "object" ||
    value === null ||
    !isPlainRecord(value) ||
    !hasOwnDataShape(value, ["kind", "id", "propertyId", "operator"], ["value"])
  )
    return false;
  const candidate = value as Partial<FilterRule>;
  return (
    candidate.kind === "rule" &&
    typeof candidate.id === "string" &&
    typeof candidate.propertyId === "string" &&
    typeof candidate.operator === "string" &&
    (!Object.hasOwn(candidate, "value") || isJsonFilterValue(candidate.value))
  );
}

function isGroup(
  value: unknown,
  depth: number,
  ancestors = new WeakSet<object>(),
): value is FilterGroup {
  if (
    depth > 3 ||
    typeof value !== "object" ||
    value === null ||
    !isPlainRecord(value) ||
    !hasOwnDataShape(value, ["kind", "id", "logic", "children"]) ||
    ancestors.has(value)
  )
    return false;
  ancestors.add(value);
  try {
    const candidate = value as Partial<FilterGroup>;
    return (
      candidate.kind === "group" &&
      typeof candidate.id === "string" &&
      (candidate.logic === "and" || candidate.logic === "or") &&
      isDensePlainArray(candidate.children) &&
      candidate.children.every(
        (child) => isRule(child) || isGroup(child, depth + 1, ancestors),
      )
    );
  } finally {
    ancestors.delete(value);
  }
}

export function validateTableFilterState(
  value: unknown,
): value is TableFilterState {
  try {
    return value === null || isGroup(value, 1);
  } catch {
    return false;
  }
}

function evaluateValidatedTableFilter(
  state: TableFilterState,
  row: Row,
  properties: Record<string, ColumnInfo>,
  plugins: Record<string, CellPlugin>,
  context: FilterEvaluationContext,
): boolean {
  if (state === null || state.children.length === 0) return true;

  const evaluate = (node: FilterRule | FilterGroup): boolean => {
    if (node.kind === "group") {
      if (node.children.length === 0) return true;
      return node.logic === "and"
        ? node.children.every(evaluate)
        : node.children.some(evaluate);
    }

    const property = properties[node.propertyId];
    if (!property || property.isDeleted) return false;
    const plugin = plugins[property.type];
    const operator = plugin?.filtering?.operators.find(
      ({ id }) => id === node.operator,
    );
    if (!plugin || !operator) return false;
    const cell = row.properties[node.propertyId];
    return operator.matches(
      cell?.value,
      row,
      property.config,
      node.value,
      context,
    );
  };

  return evaluate(state);
}

export function evaluateTableFilter(
  state: unknown,
  row: Row,
  properties: Record<string, ColumnInfo>,
  plugins: Record<string, CellPlugin>,
  context: FilterEvaluationContext,
): boolean {
  return (
    validateTableFilterState(state) &&
    evaluateValidatedTableFilter(state, row, properties, plugins, context)
  );
}

export const pluginTextIncludes: FilterFn<AnyTableFeatures, Row> =
  Object.assign(
    (
      row: TableRow<AnyTableFeatures, Row>,
      propertyId: string,
      query: unknown,
    ) => {
      const table = row.table as unknown as _TableInstance;
      const property = table.atoms.columnsInfo.get()[propertyId];
      if (!property || property.isDeleted) return false;
      const plugin = table.atoms.cellPlugins.get()[property.type];
      if (!plugin) return false;
      return plugin
        .toTextValue(row.original.properties[propertyId]?.value, row.original)
        .toLowerCase()
        .includes(String(query));
    },
    {
      resolveFilterValue: (value: unknown) => String(value).toLowerCase(),
      autoRemove: (value: unknown) =>
        value === undefined || value === null || value === "",
    },
  );

function copyFilterMetadata<TData extends RowData>(
  source: TableRow<AnyTableFeatures, TData>,
  target: TableRow<AnyTableFeatures, TData>,
) {
  target.columnFilters = source.columnFilters;
  target.columnFiltersMeta = source.columnFiltersMeta;
}

function addSubRowsToFlatModel<TData extends RowData>(
  rows: TableRow<AnyTableFeatures, TData>[],
  flatRows: TableRow<AnyTableFeatures, TData>[],
  rowsById: Record<string, TableRow<AnyTableFeatures, TData>>,
) {
  for (const row of rows) {
    flatRows.push(row);
    rowsById[row.id] = row;
    if (row.subRows.length > 0) {
      addSubRowsToFlatModel(row.subRows, flatRows, rowsById);
    }
  }
}

function filterRowsFromRoot<TData extends RowData>(
  rows: TableRow<AnyTableFeatures, TData>[],
  table: Table<AnyTableFeatures, TData>,
  matches: (row: TableRow<AnyTableFeatures, TData>) => boolean,
): RowModel<AnyTableFeatures, TData> {
  const flatRows: TableRow<AnyTableFeatures, TData>[] = [];
  const rowsById = makeObjectMap<TableRow<AnyTableFeatures, TData>>();
  const maxDepth = table.options.maxLeafRowFilterDepth ?? 100;

  const filterRows = (
    rowsToFilter: TableRow<AnyTableFeatures, TData>[],
    depth = 0,
  ): TableRow<AnyTableFeatures, TData>[] => {
    const filteredRows: TableRow<AnyTableFeatures, TData>[] = [];
    for (const originalRow of rowsToFilter) {
      if (!matches(originalRow)) continue;
      let row = originalRow;
      if (row.subRows.length > 0 && depth < maxDepth) {
        row = constructRow(
          table,
          row.id,
          row.original,
          row.index,
          row.depth,
          undefined,
          row.parentId,
        );
        copyFilterMetadata(originalRow, row);
        row.subRows = filterRows(originalRow.subRows, depth + 1);
      }
      filteredRows.push(row);
      flatRows.push(row);
      rowsById[row.id] = row;
      if (row.subRows.length > 0 && depth >= maxDepth) {
        addSubRowsToFlatModel(row.subRows, flatRows, rowsById);
      }
    }
    return filteredRows;
  };

  return { rows: filterRows(rows), flatRows, rowsById };
}

function filterRowsFromLeafs<TData extends RowData>(
  rows: TableRow<AnyTableFeatures, TData>[],
  table: Table<AnyTableFeatures, TData>,
  matches: (row: TableRow<AnyTableFeatures, TData>) => boolean,
): RowModel<AnyTableFeatures, TData> {
  const flatRows: TableRow<AnyTableFeatures, TData>[] = [];
  const rowsById = makeObjectMap<TableRow<AnyTableFeatures, TData>>();
  const maxDepth = table.options.maxLeafRowFilterDepth ?? 100;

  const filterRows = (
    rowsToFilter: TableRow<AnyTableFeatures, TData>[],
    depth = 0,
  ): TableRow<AnyTableFeatures, TData>[] => {
    const filteredRows: TableRow<AnyTableFeatures, TData>[] = [];
    for (const originalRow of rowsToFilter) {
      const row = constructRow(
        table,
        originalRow.id,
        originalRow.original,
        originalRow.index,
        originalRow.depth,
        undefined,
        originalRow.parentId,
      );
      copyFilterMetadata(originalRow, row);
      if (originalRow.subRows.length > 0 && depth < maxDepth) {
        row.subRows = filterRows(originalRow.subRows, depth + 1);
        if (!matches(row) && row.subRows.length === 0) continue;
      } else if (!matches(row)) {
        continue;
      }
      filteredRows.push(row);
      rowsById[row.id] = row;
      flatRows.push(row);
    }
    return filteredRows;
  };

  return { rows: filterRows(rows), flatRows, rowsById };
}

function filterRowsByTableOptions<TData extends RowData>(
  rows: TableRow<AnyTableFeatures, TData>[],
  table: Table<AnyTableFeatures, TData>,
  matches: (row: TableRow<AnyTableFeatures, TData>) => boolean,
) {
  return table.options.filterFromLeafRows
    ? filterRowsFromLeafs(rows, table, matches)
    : filterRowsFromRoot(rows, table, matches);
}

// Mirrors TanStack v9's createFilteredRowModel/filterRowsUtils stages. Keeping
// this computation in the outer memo lets property/plugin changes invalidate
// global search without mutating the independently owned globalFilter atom.
function prepareNativeFiltering<TData extends RowData>(
  table: Table<AnyTableFeatures, TData>,
  rowModel: RowModel<AnyTableFeatures, TData>,
  columnFilters: { id: string; value: unknown }[] | undefined,
  globalFilter: unknown,
): ((row: TableRow<AnyTableFeatures, TData>) => boolean) | null {
  const hasGlobalFilter =
    globalFilter !== undefined && globalFilter !== null && globalFilter !== "";
  if (!rowModel.rows.length || (!columnFilters?.length && !hasGlobalFilter)) {
    for (const row of rowModel.flatRows) {
      row.columnFilters = makeObjectMap<boolean>();
      row.columnFiltersMeta = makeObjectMap();
    }
    return null;
  }

  const resolvedColumnFilters: {
    id: string;
    filterFn: FilterFn<AnyTableFeatures, TData>;
    resolvedValue: unknown;
  }[] = [];
  const resolvedGlobalFilters: typeof resolvedColumnFilters = [];
  for (const columnFilter of columnFilters ?? []) {
    const column = table.getColumn(columnFilter.id);
    if (!column) continue;
    const filterFn = column.getFilterFn() as
      | FilterFn<AnyTableFeatures, TData>
      | undefined;
    if (!filterFn) continue;
    resolvedColumnFilters.push({
      id: columnFilter.id,
      filterFn,
      resolvedValue:
        filterFn.resolveFilterValue?.(columnFilter.value) ?? columnFilter.value,
    });
  }

  const filterableIds = (columnFilters ?? []).map(({ id }) => id);
  const globalFilterFn = table.getGlobalFilterFn();
  const globalColumns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanGlobalFilter());
  if (hasGlobalFilter && globalFilterFn && globalColumns.length > 0) {
    filterableIds.push("__global__");
    for (const column of globalColumns) {
      resolvedGlobalFilters.push({
        id: column.id,
        filterFn: globalFilterFn,
        resolvedValue:
          globalFilterFn.resolveFilterValue?.(globalFilter) ?? globalFilter,
      });
    }
  }

  for (const row of rowModel.flatRows) {
    row.columnFilters = makeObjectMap<boolean>();
    row.columnFiltersMeta = makeObjectMap();
    for (const filter of resolvedColumnFilters) {
      row.columnFilters[filter.id] = filter.filterFn(
        row,
        filter.id,
        filter.resolvedValue,
        (meta) => {
          row.columnFiltersMeta[filter.id] = meta;
        },
      );
    }
    if (resolvedGlobalFilters.length > 0) {
      row.columnFilters.__global__ = resolvedGlobalFilters.some((filter) =>
        filter.filterFn(row, filter.id, filter.resolvedValue, (meta) => {
          row.columnFiltersMeta[filter.id] = meta;
        }),
      );
    }
  }

  return (row) => filterableIds.every((id) => row.columnFilters[id] !== false);
}

export function getAdvancedFilteredRowModel<TData extends RowData>(): (
  table: Table<AnyTableFeatures, TData>,
) => () => RowModel<AnyTableFeatures, TData> {
  return (table) => {
    const instance = table as unknown as _TableInstance;
    const memoTable = table as unknown as Table<AnyTableFeatures, AnyRowData>;
    return tableMemo({
      feature: "advancedFilteringFeature",
      table: memoTable,
      fnName: "table.getFilteredRowModel",
      memoDeps: () => [
        table.getPreFilteredRowModel(),
        table.atoms.columnFilters.get(),
        table.atoms.globalFilter.get(),
        instance.getTableGlobalState().filters,
        instance.atoms.columnsInfo.get(),
        instance.atoms.cellPlugins.get(),
        table.getAllLeafColumns(),
        instance.atoms.filterEvaluationTick.get(),
      ],
      fn: (preFilteredRowModel, columnFilters, globalFilter, filters) => {
        const nativeMatches = prepareNativeFiltering(
          table,
          preFilteredRowModel,
          columnFilters,
          globalFilter,
        );
        const validFilters = validateTableFilterState(filters)
          ? filters
          : undefined;
        const advancedMatches =
          filters === undefined ||
          (validFilters !== undefined &&
            (validFilters === null || validFilters.children.length === 0))
            ? null
            : validFilters === undefined
              ? () => false
              : (() => {
                  const context: FilterEvaluationContext = { now: Date.now() };
                  const properties = instance.atoms.columnsInfo.get();
                  const plugins = instance.atoms.cellPlugins.get();
                  return (row: TableRow<AnyTableFeatures, TData>) =>
                    evaluateValidatedTableFilter(
                      validFilters,
                      row.original as unknown as Row,
                      properties,
                      plugins,
                      context,
                    );
                })();
        if (nativeMatches === null && advancedMatches === null) {
          return preFilteredRowModel;
        }
        return filterRowsByTableOptions(
          preFilteredRowModel.rows,
          table,
          (row) =>
            (nativeMatches?.(row) ?? true) && (advancedMatches?.(row) ?? true),
        );
      },
      onAfterUpdate: skipFirstRun(() => table_autoResetPageIndex(table)),
    });
  };
}

export const AdvancedFilteringFeature: TableFeature = {
  getInitialState: (state): AdvancedFilteringTableState => ({
    filterEvaluationTick: 0,
    ...state,
  }),
  constructTableAPIs: (table) => {
    const instance = table as unknown as _TableInstance;
    instance.getFilters = () => instance.getTableGlobalState().filters;
    instance.setFilters = (filters) => {
      if (!validateTableFilterState(filters)) return;
      const actionId = v4();
      instance.setTableGlobalState(
        (view) =>
          Object.is(view.filters, filters) ? view : { ...view, filters },
        (previous, next) => ({
          id: actionId,
          type: "view.filters.change",
          payload: {
            previousFilters: previous.filters,
            nextFilters: next.filters,
          },
        }),
      );
    };
    instance.clearFilters = () => instance.setFilters(null);
    instance.validateFilters = validateTableFilterState;
  },
};
