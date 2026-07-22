/* eslint-disable @typescript-eslint/no-unused-vars */
import type { RowData } from "@tanstack/react-table";

import {
  ColumnsInfoFeature,
  type ColumnInfoColumnApi,
  type ColumnsInfoOptions,
  type ColumnsInfoTableApi,
  type ColumnsInfoTableState,
} from "@/features/columns-info";
import {
  CountingFeature,
  type CountingOptions,
  type CountingTableApi,
  type CountingTableState,
} from "@/features/counting";
import {
  FreezingFeature,
  type FreezingOptions,
  type FreezingTableApi,
  type FreezingTableState,
} from "@/features/freezing";
import {
  ExtendedGroupingFeature,
  type ExtendedGroupingOptions,
  type ExtendedGroupingRowApi,
  type ExtendedGroupingTableApi,
  type ExtendedGroupingTableState,
} from "@/features/grouping";
import {
  TableMenuFeature,
  type TableMenuOptions,
  type TableMenuTableApi,
  type TableMenuTableState,
} from "@/features/menu";
import {
  RowActionsFeature,
  type RowActionsColumnApi,
  type RowActionsOptions,
  type RowActionsRowApi,
  type RowActionsTableApi,
} from "@/features/row-actions";
import type { ComparableValue } from "@/plugins";

declare module "@tanstack/react-table" {
  // merge our new feature's state with the existing table state
  interface TableState_FeatureMap {
    columnsInfoFeature: ColumnsInfoTableState;
    countingFeature: CountingTableState;
    freezingFeature: FreezingTableState;
    tableMenuFeature: TableMenuTableState;
    rowActionsFeature: {};
    extendedGroupingFeature: ExtendedGroupingTableState;
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
  }
}

export * from "@/features/columns-info";
export * from "@/features/counting";
export * from "@/features/extended-grouped-row-model";
export * from "@/features/freezing";
export * from "@/features/grouping";
export * from "@/features/menu";
export * from "@/features/row-actions";
export * from "@/features/constants";

export const DEFAULT_FEATURES = {
  columnsInfoFeature: ColumnsInfoFeature,
  countingFeature: CountingFeature,
  freezingFeature: FreezingFeature,
  tableMenuFeature: TableMenuFeature,
  rowActionsFeature: RowActionsFeature,
  extendedGroupingFeature: ExtendedGroupingFeature,
};
