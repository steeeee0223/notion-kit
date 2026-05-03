/* eslint-disable @typescript-eslint/no-unused-vars */
import type { RowData } from "@tanstack/react-table";

import type { ComparableValue } from "../plugins";
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
import {
  FreezingFeature,
  type FreezingOptions,
  type FreezingTableApi,
  type FreezingTableState,
} from "./freezing";
import {
  ExtendedGroupingFeature,
  ExtendedGroupingRowApi,
  type ExtendedGroupingOptions,
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

declare module "@tanstack/react-table" {
  // merge our new feature's state with the existing table state
  interface TableState
    extends CountingTableState,
      ColumnsInfoTableState,
      FreezingTableState,
      ExtendedGroupingTableState,
      TableMenuTableState {}

  // merge our new feature's options with the existing table options
  interface TableOptionsResolved<TData extends RowData>
    extends CountingOptions,
      ColumnsInfoOptions,
      FreezingOptions,
      RowActionsOptions,
      ExtendedGroupingOptions,
      TableMenuOptions {
    sync?: (debugValue?: string) => void;
  }

  // merge our new feature's instance APIs with the existing table instance APIs
  interface Table<TData extends RowData>
    extends CountingTableApi,
      ColumnsInfoTableApi,
      FreezingTableApi,
      RowActionsTableApi,
      ExtendedGroupingTableApi,
      TableMenuTableApi {}

  interface Column<TData extends RowData>
    extends ColumnInfoColumnApi,
      RowActionsColumnApi {}

  interface Row<TData extends RowData>
    extends RowActionsRowApi,
      ExtendedGroupingRowApi {
    getGroupingValue: (colId: string) => ComparableValue;
  }
}

export * from "./columns-info";
export * from "./counting";
export * from "./extended-grouped-row-model";
export * from "./freezing";
export * from "./menu";
export * from "./row-actions";
export * from "./constants";

export const DEFAULT_FEATURES = [
  ColumnsInfoFeature,
  CountingFeature,
  FreezingFeature,
  TableMenuFeature,
  RowActionsFeature,
  ExtendedGroupingFeature,
];
