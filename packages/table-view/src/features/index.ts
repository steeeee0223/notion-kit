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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableOptionsResolved<TData extends RowData>
    extends CountingOptions,
      WrappingOptions,
      FreezingOptions {}
  //merge our new feature's instance APIs with the existing table instance APIs
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Table<TData extends RowData>
    extends CountingInstance,
      WrappingInstance,
      FreezingInstance {}

  // interface TableMeta<TData extends RowData> {
  //   updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  // }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type
  interface Column<TData extends RowData> extends WrappingColumnApi {}
}

export * from "./counting";
export * from "./freezing";
export * from "./wrapping";
