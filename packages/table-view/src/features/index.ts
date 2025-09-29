import type { RowData } from "@tanstack/react-table";

import type {
  CountingInstance,
  CountingOptions,
  CountingTableState,
} from "./counting";

declare module "@tanstack/react-table" {
  //merge our new feature's state with the existing table state
  interface TableState extends CountingTableState {}
  //merge our new feature's options with the existing table options
  interface TableOptionsResolved<TData extends RowData>
    extends CountingOptions {}
  //merge our new feature's instance APIs with the existing table instance APIs
  interface Table<TData extends RowData> extends CountingInstance {}

  // interface TableMeta<TData extends RowData> {
  //   updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  // }
}

export * from "./counting";
