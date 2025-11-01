/* eslint-disable @typescript-eslint/no-unused-vars */
import type { RowData } from "@tanstack/react-table";

import type {
  ColumnInfoColumnApi,
  ColumnsInfoOptions,
  ColumnsInfoTableApi,
  ColumnsInfoTableState,
} from "./columns-info";
import type {
  CountingOptions,
  CountingTableApi,
  CountingTableState,
} from "./counting";
import type {
  FreezingOptions,
  FreezingTableApi,
  FreezingTableState,
} from "./freezing";
import type {
  TableMenuOptions,
  TableMenuTableApi,
  TableMenuTableState,
} from "./menu";
import type {
  OrderingOptions,
  OrderingTableApi,
  OrderingTableState,
} from "./ordering";
import type {
  RowActionsColumnApi,
  RowActionsOptions,
  RowActionsTableApi,
} from "./row-actions";

declare module "@tanstack/react-table" {
  // merge our new feature's state with the existing table state
  interface TableState
    extends CountingTableState,
      ColumnsInfoTableState,
      FreezingTableState,
      OrderingTableState,
      TableMenuTableState {}

  // merge our new feature's options with the existing table options
  interface TableOptionsResolved<TData extends RowData>
    extends CountingOptions,
      ColumnsInfoOptions,
      FreezingOptions,
      OrderingOptions,
      RowActionsOptions,
      TableMenuOptions {}

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
