import type { ColumnDef, OnChangeFn } from "@tanstack/react-table";
import type { Cell, Header, Row, Table } from "@tanstack/table-core";

import type { TableFeatures, TableGlobalState } from "@/features";
import type { ColumnDefs, Row as RowModel } from "@/lib/types";
import type { CellPlugin } from "@/plugins";

export interface TableState<TPlugins extends CellPlugin[]> {
  properties: ColumnDefs<TPlugins>;
  data: RowModel<TPlugins>[];
}

export interface BaseTableProps<TPlugins extends CellPlugin[]>
  extends TableState<TPlugins> {
  defaultColumn?: Partial<ColumnDef<TableFeatures, RowModel<TPlugins>>>;
  table?: Partial<TableGlobalState>;
  getRowUrl?: (rowId: string) => string;
  onDataChange?: OnChangeFn<RowModel<TPlugins>[]>;
  onPropertiesChange?: OnChangeFn<ColumnDefs<TPlugins>>;
  onTableChange?: OnChangeFn<TableGlobalState>;
}

export interface TableProps<TPlugins extends CellPlugin[]>
  extends BaseTableProps<TPlugins> {
  plugins?: TPlugins;
  children?: React.ReactNode;
}

export type TableInstance = Table<TableFeatures, RowModel>;
export type RowInstance = Row<TableFeatures, RowModel>;
export type CellInstance = Cell<TableFeatures, RowModel>;
export type HeaderInstance = Header<TableFeatures, RowModel>;
