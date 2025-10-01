import type {
  OnChangeFn,
  RowData,
  Table,
  TableFeature,
  Updater,
} from "@tanstack/react-table";
import { functionalUpdate, makeStateUpdater } from "@tanstack/react-table";

import type { Row } from "../lib/types";
import { getCount } from "../lib/utils";

// define types for our new feature's custom state
export enum CountMethod {
  NONE,
  ALL,
  VALUES,
  UNIQUE,
  EMPTY,
  NONEMPTY,
  CHECKED,
  UNCHECKED,
  PERCENTAGE_CHECKED,
  PERCENTAGE_UNCHECKED,
  PERCENTAGE_EMPTY,
  PERCENTAGE_NONEMPTY,
}

export type CountingState = Record<
  string,
  {
    method: CountMethod;
    isCapped?: boolean;
  }
>;

export interface CountingTableState {
  columnCounting: CountingState;
}

// define types for our new feature's table options
export interface CountingOptions {
  enableColumnCounting?: boolean;
  onColumnCountingChange?: OnChangeFn<CountingState>;
}

// Define types for our new feature's table APIs
export interface CountingTableApi {
  getColumnCounting: (colId: string) => CountingState[string];
  getColumnCountResult: (colId: string) => string;
  setColumnCounting: (updater: Updater<CountingState>) => void;
  setColumnCountMethod: (colId: string, method: CountMethod) => void;
  setColumnCountCapped: (colId: string, updater: Updater<boolean>) => void;
}

export const CountingFeature: TableFeature = {
  // define the new feature's initial state
  getInitialState: (state): CountingTableState => {
    return {
      columnCounting: {},
      ...state,
    };
  },

  // define the new feature's default options
  getDefaultOptions: <TData extends RowData>(
    table: Table<TData>,
  ): CountingOptions => {
    return {
      enableColumnCounting: true,
      onColumnCountingChange: makeStateUpdater("columnCounting", table),
    };
  },

  // define the new feature's table instance methods
  createTable: (table: Table<Row>): void => {
    table.getColumnCounting = (colId) => {
      if (!table.options.enableColumnCounting) {
        throw new Error(
          `[TableView] Column counting is not enabled. To enable, pass \`enableColumnCounting: true\` to your table options.`,
        );
      }
      const counting = table.getState().columnCounting;
      return counting[colId] ?? { method: CountMethod.NONE };
    };
    table.getColumnCountResult = (colId) => {
      if (!table.options.enableColumnCounting) {
        throw new Error(
          `[TableView] Column counting is not enabled. To enable, pass \`enableColumnCounting: true\` to your table options.`,
        );
      }
      return getCount(table, colId);
    };
    table.setColumnCounting = (updater) =>
      table.options.onColumnCountingChange?.((prev) =>
        functionalUpdate(updater, prev),
      );
    table.setColumnCountMethod = (colId, method) => {
      table.setColumnCounting((prev) => ({
        ...prev,
        [colId]: { ...prev[colId], method },
      }));
    };
    table.setColumnCountCapped = (colId, updater) => {
      table.setColumnCounting((prev) => ({
        ...prev,
        [colId]: {
          method: prev[colId]?.method ?? CountMethod.NONE,
          isCapped: functionalUpdate(updater, prev[colId]?.isCapped ?? false),
        },
      }));
    };
  },
};
