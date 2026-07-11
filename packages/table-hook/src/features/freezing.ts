import type { OnChangeFn, TableFeature, Updater } from "@tanstack/react-table";
import { functionalUpdate, makeStateUpdater } from "@tanstack/react-table";

import type { TableInstance } from "@/features/types";

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
    const instance = table as unknown as TableInstance;

    const throwIfDisabled = () => {
      if (!instance.options.enableColumnFreezing) {
        throw new Error(
          `[TableView] Column Freezing is not enabled. To enable, pass \`enableColumnFreezing: true\` to your table options.`,
        );
      }
    };
    const normalizeFreezingState = (state: FreezingState): FreezingState => {
      if (!state) return null;
      const index = instance.store.state.columnOrder.indexOf(state.colId);
      return index < 0 ? null : { colId: state.colId, index };
    };

    instance.getFreezingState = () => {
      throwIfDisabled();
      return normalizeFreezingState(instance.store.state.columnFreezing);
    };
    instance.getCanFreezeColumn = (colId) => {
      throwIfDisabled();
      const index = instance.store.state.columnOrder.indexOf(colId);
      return index >= 0 && index < instance.store.state.columnOrder.length - 1;
    };
    instance.setColumnFreezing = (updater) => {
      const nextState = functionalUpdate(updater, instance.getFreezingState());
      const normalizedState = normalizeFreezingState(nextState);
      instance.options.onColumnFreezingChange?.(normalizedState);
      instance.setColumnPinning({
        start: normalizedState
          ? instance.store.state.columnOrder.slice(0, normalizedState.index + 1)
          : [],
        end: instance.store.state.columnPinning.end,
      });
    };
    instance.toggleColumnFreezed = (colId) => {
      const index = instance.getColumn(colId)?.getIndex();
      if (index === undefined)
        throw new Error(`[TableView] Column with id "${colId}" not found.`);
      instance.setColumnFreezing((prev) => {
        if (prev?.colId === colId) return null;
        if (!instance.getCanFreezeColumn(colId)) return prev;
        return { colId, index };
      });
    };
  },
};
