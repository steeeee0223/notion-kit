import type { Table, TableFeature } from "@tanstack/react-table";

import type { Row } from "../lib/types";
import { SyncedState } from "../table-contexts";

export interface SyncOptions {
  sync?: (keys: (keyof SyncedState)[]) => void;
}

export const SyncFeature: TableFeature = {
  getDefaultOptions: (): SyncOptions => {
    return {};
  },

  createTable: (table: Table<Row>): void => {
    /** Overrides for inherited features */
    table.setColumnSizing = (updater) => {
      table.options.onColumnSizingChange?.(updater);
      table.options.sync?.(["header"]);
    };
    table.setColumnSizingInfo = (updater) => {
      table.options.onColumnSizingInfoChange?.(updater);
      table.options.sync?.(["header"]);
    };
    table.setColumnVisibility = (updater) => {
      table.options.onColumnVisibilityChange?.(updater);
      table.options.sync?.(["header"]);
    };
    table.setColumnPinning = (updater) => {
      table.options.onColumnPinningChange?.(updater);
      table.options.sync?.(["header", "footer"]);
    };
    table.setColumnOrder = (updater) => {
      table.options.onColumnOrderChange?.(updater);
      table.options.sync?.(["header"]);
    };
    table.setSorting = (updater) => {
      table.options.onSortingChange?.(updater);
      table.options.sync?.(["header", "body"]);
    };
    /** Overrides for custom features */
    table._addColumnInfo = (info) => {
      table.options.onColumnInfoChange?.((prev) => ({
        ...prev,
        [info.id]: info,
      }));
      table.options.sync?.(["header"]);
    };
    table.setColumnCounting = (updater) => {
      table.options.onColumnCountingChange?.(updater);
      table.options.sync?.(["footer"]);
    };
    table.setRowOrder = (updater) => {
      table.options.onRowOrderChange?.(updater);
      table.options.sync?.(["body"]);
    };
    table.setTableData = (updater) => {
      table.options.onTableDataChange?.(updater);
      table.options.sync?.(["body"]);
    };
    table.setTableMenuState = (menu) => {
      table.options.onTableMenuChange?.(menu);
      table.options.sync?.(["header"]);
    };
  },
};
