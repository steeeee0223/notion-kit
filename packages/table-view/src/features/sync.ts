import type { Table, TableFeature } from "@tanstack/react-table";

import type { Row } from "../lib/types";

export interface SyncOptions {
  sync?: () => void;
}

export const SyncFeature: TableFeature = {
  getDefaultOptions: (): SyncOptions => {
    return {};
  },

  createTable: (table: Table<Row>): void => {
    /** Overrides for inherited features */
    table.setColumnSizing = (updater) => {
      table.options.onColumnSizingChange?.(updater);
      table.options.sync?.();
    };
    table.setColumnSizingInfo = (updater) => {
      table.options.onColumnSizingInfoChange?.(updater);
      table.options.sync?.();
    };
    table.setColumnVisibility = (updater) => {
      table.options.onColumnVisibilityChange?.(updater);
      table.options.sync?.();
    };
    table.setColumnPinning = (updater) => {
      table.options.onColumnPinningChange?.(updater);
      table.options.sync?.();
    };
    table.setColumnOrder = (updater) => {
      table.options.onColumnOrderChange?.(updater);
      table.options.sync?.();
    };
    table.setSorting = (updater) => {
      table.options.onSortingChange?.(updater);
      table.options.sync?.();
    };
    /** Overrides for custom features */
    table.setColumnCounting = (updater) => {
      table.options.onColumnCountingChange?.(updater);
      table.options.sync?.();
    };
    table.setRowOrder = (updater) => {
      table.options.onRowOrderChange?.(updater);
      table.options.sync?.();
    };
    table.setTableData = (updater) => {
      table.options.onTableDataChange?.(updater);
      table.options.sync?.();
    };
    table.setTableMenuState = (menu) => {
      table.options.onTableMenuChange?.(menu);
      table.options.sync?.();
    };
  },
};
