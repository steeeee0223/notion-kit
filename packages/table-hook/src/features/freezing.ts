// @ts-nocheck
import type { OnChangeFn, TableFeature, Updater } from "@tanstack/react-table";
import { functionalUpdate, makeStateUpdater } from "@tanstack/react-table";

export type FreezingState = {
  colId: string;
  index: number;
} | null;

export interface FreezingTableState {
  columnFreezing: FreezingState;
}

export interface FreezingOptions {
  enableColumnFreezing?: boolean;
  onColumnFreezingChange?: OnChangeFn<FreezingState>;
}

export interface FreezingTableApi {
  getFreezingState: () => FreezingState;
  getCanFreezeColumn: (colId: string) => boolean;
  setColumnFreezing: (updater: Updater<FreezingState>) => void;
  toggleColumnFreezed: (colId: string) => void;
}

export const FreezingFeature: TableFeature = {
  getInitialState: (state): FreezingTableState => {
    return { columnFreezing: null, ...state };
  },

  getDefaultTableOptions: (table) => {
    return {
      enableColumnFreezing: true,
      onColumnFreezingChange: makeStateUpdater("columnFreezing", table),
    };
  },

  constructTableAPIs: (table) => {
    const throwIfDisabled = () => {
      if (!table.options.enableColumnFreezing) {
        throw new Error(
          `[TableView] Column Freezing is not enabled. To enable, pass \`enableColumnFreezing: true\` to your table options.`,
        );
      }
    };
    const normalizeFreezingState = (state: FreezingState): FreezingState => {
      if (!state) return null;
      const index = table.store.state.columnOrder.indexOf(state.colId);
      return index < 0 ? null : { colId: state.colId, index };
    };

    table.getFreezingState = () => {
      throwIfDisabled();
      return normalizeFreezingState(table.store.state.columnFreezing);
    };
    table.getCanFreezeColumn = (colId) => {
      throwIfDisabled();
      const index = table.store.state.columnOrder.indexOf(colId);
      return index >= 0 && index < table.store.state.columnOrder.length - 1;
    };
    table.setColumnFreezing = (updater) => {
      const nextState = functionalUpdate(updater, table.getFreezingState());
      const normalizedState = normalizeFreezingState(nextState);
      table.options.onColumnFreezingChange?.(normalizedState);
      table.setColumnPinning({
        left: normalizedState
          ? table.store.state.columnOrder.slice(0, normalizedState.index + 1)
          : [],
        right: table.store.state.columnPinning.right ?? [],
      });
    };
    table.toggleColumnFreezed = (colId) => {
      const index = table.getColumn(colId)?.getIndex();
      if (index === undefined)
        throw new Error(`[TableView] Column with id "${colId}" not found.`);
      table.setColumnFreezing((prev) => {
        if (prev?.colId === colId) return null;
        if (!table.getCanFreezeColumn(colId)) return prev;
        return { colId, index };
      });
    };
  },
};
