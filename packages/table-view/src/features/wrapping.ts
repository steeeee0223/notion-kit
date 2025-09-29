import type {
  Column,
  OnChangeFn,
  RowData,
  Table,
  TableFeature,
  Updater,
} from "@tanstack/react-table";
import { functionalUpdate, makeStateUpdater } from "@tanstack/react-table";

// define types for our new feature's custom state
export type WrappingState = Record<string, boolean>;

export interface WrappingTableState {
  columnWrapping: WrappingState;
}

// define types for our new feature's table options
export interface WrappingOptions {
  enableColumnWrapping?: boolean;
  onColumnWrappingChange?: OnChangeFn<WrappingState>;
}

// Define types for our new feature's table APIs
export interface WrappingInstance {
  getIsColumnWrapped: (colId: string) => boolean;
  setColumnWrapping: (updater: Updater<WrappingState>) => void;
  toggleColumnWrapped: (colId: string, updater: Updater<boolean>) => void;
}

export interface WrappingColumnApi {
  getIsWrapped: () => boolean;
}

export const WrappingFeature: TableFeature = {
  // define the new feature's initial state
  getInitialState: (state): WrappingTableState => {
    return {
      columnWrapping: {},
      ...state,
    };
  },

  // define the new feature's default options
  getDefaultOptions: <TData extends RowData>(
    table: Table<TData>,
  ): WrappingOptions => {
    return {
      enableColumnWrapping: true,
      onColumnWrappingChange: makeStateUpdater("columnWrapping", table),
    };
  },

  // define the new feature's table instance methods
  createTable: <TData extends RowData>(table: Table<TData>): void => {
    table.getIsColumnWrapped = (colId) => {
      if (!table.options.enableColumnWrapping) {
        throw new Error(
          `[TableView] Column Wrapping is not enabled. To enable, pass \`enableWrapping: true\` to your table options.`,
        );
      }
      return table.getState().columnWrapping[colId] ?? false;
    };
    table.setColumnWrapping = (updater) =>
      table.options.onColumnWrappingChange?.((prev) =>
        functionalUpdate(updater, prev),
      );
    table.toggleColumnWrapped = (colId, updater) => {
      table.setColumnWrapping((prev) => ({
        ...prev,
        [colId]: functionalUpdate(updater, prev[colId] ?? false),
      }));
    };
  },
  createColumn: <TData extends RowData>(
    column: Column<TData>,
    table: Table<TData>,
  ): void => {
    column.getIsWrapped = () => table.getIsColumnWrapped(column.id);
  },
};
