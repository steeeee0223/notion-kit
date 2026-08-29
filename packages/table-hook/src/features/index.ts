/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  columnFilteringFeature,
  columnGroupingFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createExpandedRowModel,
  createSortedRowModel,
  globalFilteringFeature,
  rowAggregationFeature,
  rowExpandingFeature,
  rowSortingFeature,
  tableFeatures,
  type TableFeatures as BaseTableFeatures,
  type RowData,
} from "@tanstack/react-table";

import type { ComparableValue } from "@notion-kit/table-hook/plugins";

import { sortBooleans, sortNumbers, sortStrings } from "@/fns";
import { COMMON_AGGREGATION_FNS } from "@/methods";

import {
  ColumnsInfoFeature,
  type ColumnInfoColumnApi,
  type ColumnsInfoOptions,
  type ColumnsInfoTableApi,
  type ColumnsInfoTableState,
} from "./columns-info";
import {
  CountingFeature,
  type CountingOptions,
  type CountingTableApi,
  type CountingTableState,
} from "./counting";
import { getExtendedGroupedRowModel } from "./extended-grouped-row-model";
import {
  AdvancedFilteringFeature,
  getAdvancedFilteredRowModel,
  pluginTextIncludes,
  type AdvancedFilteringTableApi,
  type AdvancedFilteringTableState,
} from "./filtering";
import {
  FreezingFeature,
  type FreezingOptions,
  type FreezingTableApi,
  type FreezingTableState,
} from "./freezing";
import {
  ExtendedGroupingFeature,
  type ExtendedGroupingOptions,
  type ExtendedGroupingRowApi,
  type ExtendedGroupingTableApi,
  type ExtendedGroupingTableState,
} from "./grouping";
import {
  TableMenuFeature,
  type TableMenuOptions,
  type TableMenuTableApi,
  type TableMenuTableState,
} from "./menu";
import {
  RowActionsFeature,
  type RowActionsColumnApi,
  type RowActionsOptions,
  type RowActionsRowApi,
  type RowActionsTableApi,
} from "./row-actions";
import { InternalRowSelectionFeature } from "./row-selection";

export {
  AdvancedFilteringFeature,
  appendFilterNode,
  countFilterRules,
  createFilterGroup,
  createFilterRule,
  evaluateTableFilter,
  getAdvancedFilteredRowModel,
  pluginTextIncludes,
  removeFilterNode,
  updateFilterNode,
  validateTableFilterState,
} from "./filtering";
export type {
  AdvancedFilteringTableApi,
  AdvancedFilteringTableState,
  FilterGroup,
  FilterLogic,
  FilterRule,
  FilterValue,
  TableFilterState,
} from "./filtering";

declare module "@tanstack/table-core" {
  // merge our new feature's state with the existing table state
  interface TableState_FeatureMap {
    columnsInfoFeature: ColumnsInfoTableState;
    countingFeature: CountingTableState;
    freezingFeature: FreezingTableState;
    tableMenuFeature: TableMenuTableState;
    rowActionsFeature: Record<never, never>;
    extendedGroupingFeature: ExtendedGroupingTableState;
    advancedFilteringFeature: AdvancedFilteringTableState;
  }

  interface TableState_All
    extends Partial<
      ColumnsInfoTableState &
        CountingTableState &
        FreezingTableState &
        TableMenuTableState &
        ExtendedGroupingTableState &
        AdvancedFilteringTableState
    > {
    __tableHookStateBrand?: never;
  }

  // merge our new feature's options with the existing table options
  interface TableOptions_FeatureMap<TFeatures, TData extends RowData> {
    columnsInfoFeature: ColumnsInfoOptions;
    countingFeature: CountingOptions;
    freezingFeature: FreezingOptions;
    tableMenuFeature: TableMenuOptions;
    rowActionsFeature: RowActionsOptions;
    extendedGroupingFeature: ExtendedGroupingOptions;
  }

  // merge our new feature's instance APIs with the existing table instance APIs
  interface Table_FeatureMap<TFeatures, TData extends RowData> {
    columnsInfoFeature: ColumnsInfoTableApi;
    countingFeature: CountingTableApi;
    freezingFeature: FreezingTableApi;
    tableMenuFeature: TableMenuTableApi;
    rowActionsFeature: RowActionsTableApi;
    extendedGroupingFeature: ExtendedGroupingTableApi;
    advancedFilteringFeature: AdvancedFilteringTableApi;
  }

  interface Column_FeatureMap<TFeatures, TData extends RowData> {
    columnsInfoFeature: ColumnInfoColumnApi;
    rowActionsFeature: RowActionsColumnApi;
  }

  interface Row_FeatureMap<TFeatures, TData extends RowData> {
    rowActionsFeature: RowActionsRowApi;
    extendedGroupingFeature: ExtendedGroupingRowApi & {
      getGroupingValue: (colId: string) => ComparableValue;
    };
  }

  interface Plugins {
    columnsInfoFeature: typeof ColumnsInfoFeature;
    countingFeature: typeof CountingFeature;
    freezingFeature: typeof FreezingFeature;
    tableMenuFeature: typeof TableMenuFeature;
    rowActionsFeature: typeof RowActionsFeature;
    extendedGroupingFeature: typeof ExtendedGroupingFeature;
    advancedFilteringFeature: typeof AdvancedFilteringFeature;
  }
}

export * from "@/features/columns-info";
export * from "@/features/counting";
export * from "@/features/extended-grouped-row-model";
export * from "@/features/freezing";
export * from "@/features/grouping";
export * from "@/features/menu";
export * from "@/features/row-actions";
export * from "@/features/plugin-methods";
export * from "@/features/constants";
export * from "@/features/types";

export interface TableFeatures extends BaseTableFeatures {
  columnsInfoFeature: typeof ColumnsInfoFeature;
  countingFeature: typeof CountingFeature;
  freezingFeature: typeof FreezingFeature;
  tableMenuFeature: typeof TableMenuFeature;
  rowActionsFeature: typeof RowActionsFeature;
  extendedGroupingFeature: typeof ExtendedGroupingFeature;
  advancedFilteringFeature: typeof AdvancedFilteringFeature;
  rowSelectionFeature: typeof InternalRowSelectionFeature;
  aggregationFns: typeof COMMON_AGGREGATION_FNS;
  filterFns: { pluginTextIncludes: typeof pluginTextIncludes };
  sortFns: typeof COMMON_SORT_FNS;
}

const COMMON_SORT_FNS = {
  checkbox: sortBooleans,
  number: sortNumbers,
  text: sortStrings,
} as const;

export const DEFAULT_FEATURES = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  columnGroupingFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  rowExpandingFeature,
  rowSelectionFeature: InternalRowSelectionFeature,
  rowAggregationFeature,
  aggregationFns: COMMON_AGGREGATION_FNS,
  rowSortingFeature,
  sortFns: COMMON_SORT_FNS,
  filterFns: { pluginTextIncludes },
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: getAdvancedFilteredRowModel(),
  groupedRowModel: getExtendedGroupedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  columnsInfoFeature: ColumnsInfoFeature,
  countingFeature: CountingFeature,
  freezingFeature: FreezingFeature,
  tableMenuFeature: TableMenuFeature,
  advancedFilteringFeature: AdvancedFilteringFeature,
  rowActionsFeature: RowActionsFeature,
  extendedGroupingFeature: ExtendedGroupingFeature,
});
