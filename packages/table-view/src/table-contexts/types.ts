import type { OnChangeFn } from "@tanstack/react-table";

import { TableGlobalState } from "../features";
import type { ColumnDefs, Row } from "../lib/types";
import type { CellPlugin } from "../plugins";

export interface TableState<TPlugins extends CellPlugin[]> {
  properties: ColumnDefs<TPlugins>;
  data: Row<TPlugins>[];
}

export interface BaseTableProps<TPlugins extends CellPlugin[]>
  extends TableState<TPlugins> {
  table?: TableGlobalState;
  onDataChange?: OnChangeFn<Row<TPlugins>[]>;
  onPropertiesChange?: OnChangeFn<ColumnDefs<TPlugins>>;
  onTableChange?: OnChangeFn<TableGlobalState>;
}

export interface TableProps<TPlugins extends CellPlugin[]>
  extends BaseTableProps<TPlugins> {
  plugins?: TPlugins;
  children?: React.ReactNode;
}
