import type { RowData } from "@tanstack/react-table";

import type {
  CountingInstance,
  CountingOptions,
  CountingTableState,
} from "./counting";
import type {
  FreezingInstance,
  FreezingOptions,
  FreezingTableState,
} from "./freezing";
import type {
  WrappingColumnApi,
  WrappingInstance,
  WrappingOptions,
  WrappingTableState,
} from "./wrapping";

declare module "@tanstack/react-table" {
  //merge our new feature's state with the existing table state
  interface TableState
    extends CountingTableState,
      WrappingTableState,
      FreezingTableState {}
  //merge our new feature's options with the existing table options
  interface TableOptionsResolved<TData extends RowData>
    extends CountingOptions,
      WrappingOptions,
      FreezingOptions {}
  //merge our new feature's instance APIs with the existing table instance APIs
  interface Table<TData extends RowData>
    extends CountingInstance,
      WrappingInstance,
      FreezingInstance {}

  // interface TableMeta<TData extends RowData> {
  //   updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  // }

  interface Column<TData extends RowData, TValue = unknown>
    extends WrappingColumnApi {}
}

export * from "./counting";
export * from "./freezing";
export * from "./wrapping";
