import type {
  OnChangeFn,
  RowData,
  Table,
  TableFeature,
  Updater,
} from "@tanstack/react-table";
import { functionalUpdate, makeStateUpdater } from "@tanstack/react-table";

// define types for our new feature's custom state
export type FreezingState = {
  colId: string;
  index: number;
} | null;

export interface FreezingTableState {
  columnFreezing: FreezingState;
}

// define types for our new feature's table options
export interface FreezingOptions {
  enableColumnFreezing?: boolean;
  onColumnFreezingChange?: OnChangeFn<FreezingState>;
}

// Define types for our new feature's table APIs
export interface FreezingTableApi {
  getFreezingState: () => FreezingState;
  getCanFreezeColumn: (colId: string) => boolean;
  setColumnFreezing: (updater: Updater<FreezingState>) => void;
  toggleColumnFreezed: (colId: string) => void;
}

export const FreezingFeature: TableFeature = {
  // define the new feature's initial state
  getInitialState: (state): FreezingTableState => {
    return { columnFreezing: null, ...state };
  },

  // define the new feature's default options
  getDefaultOptions: <TData extends RowData>(
    table: Table<TData>,
  ): FreezingOptions => {
    return {
      enableColumnFreezing: true,
      onColumnFreezingChange: makeStateUpdater("columnFreezing", table),
    };
  },

  // define the new feature's table instance methods
  createTable: <TData extends RowData>(table: Table<TData>): void => {
    const throwIfDisabled = () => {
      if (!table.options.enableColumnFreezing) {
        throw new Error(
          `[TableView] Column Freezing is not enabled. To enable, pass \`enableColumnFreezing: true\` to your table options.`,
        );
      }
    };
    table.getFreezingState = () => {
      throwIfDisabled();
      return table.getState().columnFreezing;
    };
    table.getCanFreezeColumn = (colId) => {
      throwIfDisabled();
      return table.getState().columnOrder.at(-1) !== colId;
    };
    table.setColumnFreezing = (updater) => {
      const nextState = functionalUpdate(
        updater,
        table.getState().columnFreezing,
      );
      table.options.onColumnFreezingChange?.(nextState);
      table.setColumnPinning({
        left: nextState
          ? table.getState().columnOrder.slice(0, nextState.index + 1)
          : [],
      });
      table.options.meta?.sync?.(["header", "footer"]);
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
