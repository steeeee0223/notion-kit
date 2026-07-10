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
    table.getFreezingState = () => {
      throwIfDisabled();
      return table.store.state.columnFreezing;
    };
    table.getCanFreezeColumn = (colId) => {
      throwIfDisabled();
      return table.store.state.columnOrder.at(-1) !== colId;
    };
    table.setColumnFreezing = (updater) => {
      const nextState = functionalUpdate(
        updater,
        table.store.state.columnFreezing,
      );
      table.options.onColumnFreezingChange?.(nextState);
      table.setColumnPinning({
        left: nextState
          ? table.store.state.columnOrder.slice(0, nextState.index + 1)
          : [],
      });
    };
    table.toggleColumnFreezed = (colId) => {
      const index = table.getColumn(colId)?.getIndex();
      if (index === undefined)
        throw new Error(`[TableView] Column with id "${colId}" not found.`);
      table.setColumnFreezing((prev) =>
        prev?.colId === colId ? null : { colId, index },
      );
    };
  },
};
