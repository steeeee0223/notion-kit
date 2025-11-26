import {
  makeStateUpdater,
  type OnChangeFn,
  type RowData,
  type Table,
  type TableFeature,
} from "@tanstack/react-table";

import type { Row } from "../lib/types";

export enum TableViewMenuPage {
  Sort,
  Visibility,
  Props,
  DeletedProps,
  CreateProp,
  EditProp,
  ChangePropType,
  EditGroupBy,
  SelectGroupBy,
}

export interface TableMenuState {
  open: boolean;
  page: TableViewMenuPage | null;
  id?: string;
  data?: Record<string, unknown>;
}
export interface TableGlobalState {
  locked?: boolean;
}

export interface TableMenuTableState {
  menu: TableMenuState;
  tableGlobal: TableGlobalState;
}

export interface TableMenuOptions {
  onTableMenuChange?: OnChangeFn<TableMenuState>;
  onTableGlobalChange?: OnChangeFn<TableGlobalState>;
}

export interface TableMenuTableApi {
  getTableMenuState: () => TableMenuState;
  setTableMenuState: (state: TableMenuState) => void;
  getTableGlobalState: () => TableGlobalState;
  setTableGlobalState: OnChangeFn<TableGlobalState>;
  toggleTableLocked: () => void;
}

export const TableMenuFeature: TableFeature = {
  getInitialState: (state): TableMenuTableState => {
    return {
      menu: { open: false, page: null },
      tableGlobal: { locked: false },
      ...state,
    };
  },

  getDefaultOptions: <TData extends RowData>(
    table: Table<TData>,
  ): TableMenuOptions => {
    return {
      onTableMenuChange: makeStateUpdater("menu", table),
      onTableGlobalChange: makeStateUpdater("tableGlobal", table),
    };
  },

  createTable: (table: Table<Row>): void => {
    table.getTableMenuState = () => table.getState().menu;
    table.setTableMenuState = (menu) => {
      table.options.onTableMenuChange?.(menu);
      table.options.sync?.("table.setTableMenuState");
    };
    table.getTableGlobalState = () => table.getState().tableGlobal;
    table.setTableGlobalState = (updater) => {
      table.options.onTableGlobalChange?.(updater);
      table.options.sync?.("table.setTableGlobalState");
    };
    table.toggleTableLocked = () => {
      table.setTableGlobalState((v) => ({ ...v, locked: !v.locked }));
    };
  },
};
