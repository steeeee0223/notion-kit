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
}

export interface TableMenuState {
  open: boolean;
  page: TableViewMenuPage | null;
  id?: string;
  data?: Record<string, unknown>;
}

export interface TableMenuTableState {
  menu: TableMenuState;
}

export interface TableMenuOptions {
  onTableMenuChange?: OnChangeFn<TableMenuState>;
}

export interface TableMenuTableApi {
  getTableMenuState: () => TableMenuState;
  setTableMenuState: (state: TableMenuState) => void;
}

export const TableMenuFeature: TableFeature = {
  getInitialState: (state): TableMenuTableState => {
    return {
      menu: { open: false, page: null },
      ...state,
    };
  },

  getDefaultOptions: <TData extends RowData>(
    table: Table<TData>,
  ): TableMenuOptions => {
    return {
      onTableMenuChange: makeStateUpdater("menu", table),
    };
  },

  createTable: (table: Table<Row>): void => {
    table.getTableMenuState = () => table.getState().menu;
    table.setTableMenuState = (menu) => {
      table.options.onTableMenuChange?.(menu);
      table.options.sync?.();
    };
  },
};
