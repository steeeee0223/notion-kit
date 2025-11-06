import type { OnChangeFn } from "@tanstack/react-table";

import type { ColumnDefs, Row } from "../lib/types";
import type { CellPlugin } from "../plugins";

export interface TableState<TPlugins extends CellPlugin[]> {
  properties: ColumnDefs<TPlugins>;
  data: Row<TPlugins>[];
}

export interface TableProps<TPlugins extends CellPlugin[]>
  extends TableState<TPlugins> {
  plugins?: TPlugins;
  onDataChange?: OnChangeFn<Row<TPlugins>[]>;
  onPropertiesChange?: OnChangeFn<ColumnDefs<TPlugins>>;
}

export interface SyncedState {
  header: number;
  body: number;
  footer: number;
}
