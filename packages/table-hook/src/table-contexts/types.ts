import type { ColumnDef } from "@tanstack/react-table";
import type { Cell, Header, Row, Table } from "@tanstack/table-core";

import type { TableFeatures, TableViewState } from "@/features";
import type { ColumnDefs, Row as RowModel } from "@/lib/types";
import type { CellPlugin } from "@/plugins";
import type {
  DataResourceAction,
  PropertiesResourceAction,
  ResourceChangeHandler,
  ViewResourceAction,
} from "@/table-contexts/actions";

export interface TableState<TPlugins extends CellPlugin[]> {
  properties: ColumnDefs<TPlugins>;
  data: RowModel<TPlugins>[];
}

type DataResourceProps<TPlugins extends CellPlugin[]> =
  | {
      data: RowModel<TPlugins>[];
      defaultData?: never;
      onDataChange?: ResourceChangeHandler<
        RowModel<TPlugins>[],
        DataResourceAction
      >;
    }
  | {
      data?: never;
      defaultData?: RowModel<TPlugins>[];
      onDataChange?: ResourceChangeHandler<
        RowModel<TPlugins>[],
        DataResourceAction
      >;
    };

type PropertiesResourceProps<TPlugins extends CellPlugin[]> =
  | {
      properties: ColumnDefs<TPlugins>;
      defaultProperties?: never;
      onPropertiesChange?: ResourceChangeHandler<
        ColumnDefs<TPlugins>,
        PropertiesResourceAction
      >;
    }
  | {
      properties?: never;
      defaultProperties?: ColumnDefs<TPlugins>;
      onPropertiesChange?: ResourceChangeHandler<
        ColumnDefs<TPlugins>,
        PropertiesResourceAction
      >;
    };

type ViewResourceProps =
  | {
      view: Partial<TableViewState>;
      defaultView?: never;
      onViewChange?: ResourceChangeHandler<TableViewState, ViewResourceAction>;
    }
  | {
      view?: never;
      defaultView?: Partial<TableViewState>;
      onViewChange?: ResourceChangeHandler<TableViewState, ViewResourceAction>;
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
