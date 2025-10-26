import type { Table, TableFeature } from "@tanstack/react-table";

import type { Row } from "../lib/types";

// define types for our new feature's custom state
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

// Define types for our new feature's table APIs
export interface TableMenuTableApi {
  getTableMenuState: () => TableMenuState;
  setTableMenuState: (state: TableMenuState) => void;
}

export const TableMenuFeature: TableFeature = {
  // define the new feature's initial state
  getInitialState: (state): TableMenuTableState => {
    return {
      menu: { open: false, page: null },
      ...state,
    };
  },

  // define the new feature's table instance methods
  createTable: (table: Table<Row>): void => {
    table.getTableMenuState = () => table.getState().menu;
    table.setTableMenuState = (menu) =>
      table.setState((prev) => ({ ...prev, menu }));
  },
};
