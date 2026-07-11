import type { OnChangeFn, TableFeature, Updater } from "@tanstack/react-table";
import { functionalUpdate, makeStateUpdater } from "@tanstack/react-table";

import type { TableInstance } from "@/features/types";
import { getCount } from "@/lib/utils";
import { CountMethod } from "@/methods";

export { CountMethod };

export type CountingState = Record<
  string,
  {
    method: CountMethod | string;
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
  setColumnCountMethod: (colId: string, method: string) => void;
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
  getDefaultTableOptions: (table) => {
    return {
      enableColumnCounting: true,
      onColumnCountingChange: makeStateUpdater("columnCounting", table),
    };
  },

  // define the new feature's table instance methods
  constructTableAPIs: (table) => {
    const instance = table as unknown as TableInstance;

    instance.getColumnCounting = (colId) => {
      if (!instance.options.enableColumnCounting) {
        throw new Error(
          `[TableView] Column counting is not enabled. To enable, pass \`enableColumnCounting: true\` to your table options.`,
        );
      }
      const counting = instance.store.state.columnCounting;
      return counting[colId] ?? { method: CountMethod.NONE };
    };
    instance.getColumnCountResult = (colId) => {
      if (!instance.options.enableColumnCounting) {
        throw new Error(
          `[TableView] Column counting is not enabled. To enable, pass \`enableColumnCounting: true\` to your table options.`,
        );
      }
      return getCount(instance, colId);
    };
    instance.setColumnCounting = (updater) =>
      instance.options.onColumnCountingChange?.(updater);
    instance.setColumnCountMethod = (colId, method) => {
      instance.setColumnCounting((prev) => ({
        ...prev,
        [colId]: { ...prev[colId], method },
      }));
    };
    instance.setColumnCountCapped = (colId, updater) => {
      instance.setColumnCounting((prev) => ({
        ...prev,
        [colId]: {
          method: prev[colId]?.method ?? CountMethod.NONE,
          isCapped: functionalUpdate(updater, prev[colId]?.isCapped ?? false),
        },
      }));
    };
  },
};
