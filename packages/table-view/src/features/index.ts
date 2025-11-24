/* eslint-disable @typescript-eslint/no-unused-vars */
import type { RowData } from "@tanstack/react-table";

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
  TableMenuFeature,
  type TableMenuOptions,
  type TableMenuTableApi,
  type TableMenuTableState,
} from "./menu";
import { OrderingFeature, type OrderingTableApi } from "./ordering";
import {
  RowActionsFeature,
  type RowActionsColumnApi,
  type RowActionsOptions,
  type RowActionsTableApi,
} from "./row-actions";
import { SyncFeature, type SyncOptions } from "./sync";

declare module "@tanstack/react-table" {
  // merge our new feature's state with the existing table state
  interface TableState
    extends CountingTableState,
      ColumnsInfoTableState,
      FreezingTableState,
      TableMenuTableState {}

  // merge our new feature's options with the existing table options
  interface TableOptionsResolved<TData extends RowData>
    extends CountingOptions,
      ColumnsInfoOptions,
      FreezingOptions,
      RowActionsOptions,
      TableMenuOptions,
      SyncOptions {}

  // merge our new feature's instance APIs with the existing table instance APIs
  interface Table<TData extends RowData>
    extends CountingTableApi,
      ColumnsInfoTableApi,
      FreezingTableApi,
      OrderingTableApi,
      RowActionsTableApi,
      TableMenuTableApi {}

  interface Column<TData extends RowData>
    extends ColumnInfoColumnApi,
      RowActionsColumnApi {}
}

export * from "./columns-info";
export * from "./counting";
export * from "./freezing";
export * from "./menu";
export * from "./ordering";
export * from "./row-actions";
export * from "./sync";

export const DEFAULT_FEATURES = [
  ColumnsInfoFeature,
  CountingFeature,
  FreezingFeature,
  OrderingFeature,
  TableMenuFeature,
  RowActionsFeature,
  SyncFeature,
];
