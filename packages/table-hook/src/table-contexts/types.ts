import type { ColumnDef } from "@tanstack/react-table";
import type { Cell, Header, Row, Table } from "@tanstack/table-core";

import type { TableFeatures, TableViewState } from "@/features";
import type { ColumnDefs, Row as RowModel } from "@/lib/types";
import type { CellPlugin } from "@/plugins";

export interface TableState<TPlugins extends CellPlugin[]> {
  properties: ColumnDefs<TPlugins>;
  data: RowModel<TPlugins>[];
}

export type ResourceChangeHandler<TResource> = (next: TResource) => unknown;

type DataResourceProps<TPlugins extends CellPlugin[]> =
  | {
      data: RowModel<TPlugins>[];
      defaultData?: never;
      onDataChange?: ResourceChangeHandler<RowModel<TPlugins>[]>;
    }
  | {
      data?: never;
      defaultData?: RowModel<TPlugins>[];
      onDataChange?: ResourceChangeHandler<RowModel<TPlugins>[]>;
    };

type PropertiesResourceProps<TPlugins extends CellPlugin[]> =
  | {
      properties: ColumnDefs<TPlugins>;
      defaultProperties?: never;
      onPropertiesChange?: ResourceChangeHandler<ColumnDefs<TPlugins>>;
    }
  | {
      properties?: never;
      defaultProperties?: ColumnDefs<TPlugins>;
      onPropertiesChange?: ResourceChangeHandler<ColumnDefs<TPlugins>>;
    };

type ViewResourceProps =
  | {
      view: Partial<TableViewState>;
      defaultView?: never;
      onViewChange?: ResourceChangeHandler<TableViewState>;
    }
  | {
      view?: never;
      defaultView?: Partial<TableViewState>;
      onViewChange?: ResourceChangeHandler<TableViewState>;
    };

interface SharedTableProps<TPlugins extends CellPlugin[]> {
  defaultColumn?: Partial<ColumnDef<TableFeatures, RowModel<TPlugins>>>;
  getRowUrl?: (rowId: string) => string;
}

export type BaseTableProps<TPlugins extends CellPlugin[]> =
  SharedTableProps<TPlugins> &
    DataResourceProps<TPlugins> &
    PropertiesResourceProps<TPlugins> &
    ViewResourceProps;

export type TableProps<TPlugins extends CellPlugin[]> =
  BaseTableProps<TPlugins> & {
    plugins?: TPlugins;
    children?: React.ReactNode;
  };

export type TableInstance = Table<TableFeatures, RowModel>;
export type RowInstance = Row<TableFeatures, RowModel>;
export type CellInstance = Cell<TableFeatures, RowModel>;
export type HeaderInstance = Header<TableFeatures, RowModel>;
