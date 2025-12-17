import {
  makeStateUpdater,
  type OnChangeFn,
  type TableFeature,
} from "@tanstack/react-table";

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

export interface TableGlobalState {
  locked?: boolean;
  layout: LayoutType;
  rowView: RowViewType;
  openedRowId: string | null;
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
  setTableLayout: (layout: LayoutType) => void;
  openRow: (id: string | null) => void;
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

  getDefaultOptions: (table) => {
    return {
      onTableMenuChange: makeStateUpdater("menu", table),
      onTableGlobalChange: makeStateUpdater("tableGlobal", table),
    };
  },

  createTable: (table) => {
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
    table.setTableLayout = (layout) => {
      table.setTableGlobalState((v) => ({ ...v, layout }));
    };
    table.openRow = (id) => {
      table.setTableGlobalState((v) => ({ ...v, openedRowId: id }));
    };

    /**
     * override
     */
    table.setSorting = (updater) => {
      table.options.onSortingChange?.(updater);
      table.options.sync?.("table.setSorting");
    };
  },
};
