import {
  makeStateUpdater,
  type TableFeature,
  type Updater,
} from "@tanstack/react-table";
import { v4 } from "uuid";

import type { _TableInstance } from "@/features/types";
import type { ResourceChangeFn, ViewResourceAction } from "@/table-contexts";

export enum TableViewMenuPage {
  Layout,
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

export type LayoutType =
  | "table"
  | "board"
  | "timeline"
  | "calendar"
  | "list"
  | "gallery"
  | "chart";

export const LAYOUT_OPTIONS: {
  label: string;
  value: LayoutType;
}[] = [
  { label: "Table", value: "table" },
  { label: "Board", value: "board" },
  { label: "Timeline", value: "timeline" },
  { label: "Calendar", value: "calendar" },
  { label: "List", value: "list" },
  { label: "Gallery", value: "gallery" },
  { label: "Chart", value: "chart" },
];

export type RowViewType = "center" | "side" | "full";

export interface TableViewState {
  locked?: boolean;
  layout: LayoutType;
  rowView: RowViewType;
  openedRowId: string | null;
}

export type TableGlobalState = TableViewState;

export interface TableMenuTableState {
  menu: TableMenuState;
  tableGlobal: TableViewState;
}

export interface TableMenuOptions {
  getRowUrl?: (rowId: string) => string;
  onTableMenuChange?: (updater: Updater<TableMenuState>) => void;
  onTableGlobalChange?: ResourceChangeFn<TableViewState, ViewResourceAction>;
}

export interface TableMenuTableApi {
  getRowUrl: (rowId: string) => string;
  getTableMenuState: () => TableMenuState;
  setTableMenuState: (state: TableMenuState) => void;
  getTableGlobalState: () => TableViewState;
  setTableGlobalState: ResourceChangeFn<TableViewState, ViewResourceAction>;
  toggleTableLocked: () => void;
  setTableLayout: (layout: LayoutType) => void;
  openRow: (id: string | null) => void;
  openRowInFullPage: (id: string) => void;
  openRowInTab: (id: string) => void;
}

export const TableMenuFeature: TableFeature = {
  getInitialState: (state): TableMenuTableState => {
    return {
      menu: { open: false, page: null },
      tableGlobal: {
        locked: false,
        layout: "table",
        rowView: "side",
        openedRowId: null,
      },
      ...state,
    };
  },

  getDefaultTableOptions: (table) => {
    return {
      onTableMenuChange: makeStateUpdater("menu", table),
      onTableGlobalChange: (updater) =>
        makeStateUpdater("tableGlobal", table)(updater),
    };
  },

  constructTableAPIs: (table) => {
    const instance = table as unknown as _TableInstance;

    instance.getRowUrl = (rowId: string) =>
      instance.options.getRowUrl?.(rowId) ?? "";
    instance.getTableMenuState = () => instance.store.state.menu;
    instance.setTableMenuState = (menu) => {
      instance.options.onTableMenuChange?.(menu);
    };
    instance.getTableGlobalState = () => instance.store.state.tableGlobal;
    instance.setTableGlobalState = (updater, action) => {
      instance.options.onTableGlobalChange?.(updater, action);
    };
    instance.toggleTableLocked = () => {
      const actionId = v4();
      instance.setTableGlobalState(
        (v) => ({ ...v, locked: !v.locked }),
        (previous, next) => ({
          id: actionId,
          type: "view.lock.change",
          payload: {
            previousLocked: previous.locked,
            nextLocked: next.locked,
          },
        }),
      );
    };
    instance.setTableLayout = (layout) => {
      const actionId = v4();
      instance.setTableGlobalState(
        (v) => ({ ...v, layout }),
        (previous, next) => ({
          id: actionId,
          type: "view.layout.change",
          payload: {
            previousLayout: previous.layout,
            nextLayout: next.layout,
          },
        }),
      );
    };
    /** Row view */
    instance.openRow = (id) => {
      const actionId = v4();
      instance.setTableGlobalState(
        (v) => ({ ...v, openedRowId: id }),
        (previous, next) => ({
          id: actionId,
          type: "view.opened_row.change",
          payload: {
            previousRowId: previous.openedRowId,
            nextRowId: next.openedRowId,
          },
        }),
      );
      const { rowView } = instance.getTableGlobalState();
      if (!id || rowView !== "full") return;
      instance.openRowInFullPage(id);
    };
    instance.openRowInFullPage = (id) => {
      const actionId = v4();
      instance.setTableGlobalState(
        (v) => ({
          ...v,
          openedRowId: id,
          rowView: "full",
        }),
        (previous, next) => ({
          id: actionId,
          type: "view.row_display.change",
          payload: {
            previousRowView: previous.rowView,
            nextRowView: next.rowView,
          },
        }),
      );
      const url = instance.getRowUrl(id);
      if (!url || typeof window === "undefined") return;
      window.open(url, "_self");
    };
    instance.openRowInTab = (id) => {
      const url = instance.getRowUrl(id);
      if (typeof window === "undefined") return;
      window.open(url, "_blank", "noopener,noreferrer");
    };
  },
};
