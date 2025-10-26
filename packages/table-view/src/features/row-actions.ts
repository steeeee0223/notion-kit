import type { OnChangeFn, Table, TableFeature } from "@tanstack/react-table";
import { v4 } from "uuid";

import type { IconData } from "@notion-kit/icon-block";

import type { Cell, Row, Rows } from "../lib/types";
import { getDefaultCell, insertAt } from "../lib/utils";
import type { CellPlugin } from "../plugins";
import { TitlePlugin } from "../plugins/title";

// define types for our new feature's table options
export interface RowActionsOptions {
  onCellChange?: <TPlugin extends CellPlugin>(
    rowId: string,
    colId: string,
    data: Cell<TPlugin>,
  ) => void;
  onTableDataChange?: OnChangeFn<Rows>;
}

// Define types for our new feature's table APIs
export interface RowActionsTableApi {
  setTableData: OnChangeFn<Rows>;
  // Cell API
  getCellValues: <TPlugins extends CellPlugin[]>() => Rows<TPlugins>;
  getCell: <TPlugin extends CellPlugin>(
    colId: string,
    rowId: string,
  ) => Cell<TPlugin>;
  updateCell: <TPlugin extends CellPlugin>(
    rowId: string,
    colId: string,
    data: Cell<TPlugin>,
  ) => void;
  // Row API
  addRow: (payload?: { id: string; at?: "prev" | "next" }) => void;
  duplicateRow: (id: string) => void;
  deleteRow: (id: string) => void;
  updateRowIcon: (id: string, icon: IconData | null) => void;
}

export interface RowActionsColumnApi {
  // Cell updater
  getCell: <TPlugin extends CellPlugin>(rowId: string) => Cell<TPlugin>;
  updateCell: <TPlugin extends CellPlugin>(
    rowId: string,
    data: Cell<TPlugin>,
  ) => void;
}

export const RowActionsFeature: TableFeature = {
  // define the new feature's default options
  getDefaultOptions: (): RowActionsOptions => {
    return {};
  },

  // define the new feature's table instance methods
  createTable: (table: Table<Row>): void => {
    table.setTableData = (updater) =>
      table.options.onTableDataChange?.(updater);
    /** Cell API */
    table.getCellValues = () =>
      table.getCoreRowModel().rows.reduce<Rows>((acc, row) => {
        acc[row.id] = row.original;
        return acc;
      }, {});
    table.getCell = (colId, rowId) => {
      const cell = table.getRow(rowId).original.properties[colId];
      if (!cell) {
        throw new Error(`[TableView] Cell not found: ${rowId}, ${colId}`);
      }
      return cell;
    };
    table.updateCell = (rowId, colId, data) =>
      table.options.onCellChange?.(rowId, colId, data);
    /** Row API */
    table.addRow = (payload) => {
      const row: Row = { id: v4(), properties: {} };
      table.getState().columnOrder.forEach((colId) => {
        const plugin = table.getColumnPlugin(colId);
        row.properties[colId] = getDefaultCell(plugin);
      });
      // Update row order
      table.setRowOrder((prev) => {
        if (payload === undefined) return [...prev, row.id];
        const idx = prev.indexOf(payload.id);
        return payload.at === "next"
          ? insertAt(prev, row.id, idx + 1)
          : insertAt(prev, row.id, idx);
      });
      // Update table data
      table.setTableData((prev) => ({ ...prev, [row.id]: row }));
    };
    table.duplicateRow = (id) => {
      const src = table.getRow(id).original;
      const row: Row = { id: v4(), properties: {}, icon: src.icon };
      table.getState().columnOrder.forEach((colId) => {
        row.properties[colId] = { ...src.properties[colId]!, id: v4() };
      });
      // Update row order
      table.setRowOrder((prev) => {
        const idx = prev.indexOf(id);
        return insertAt(prev, row.id, idx + 1);
      });
      // Update table data
      table.setTableData((prev) => ({ ...prev, [row.id]: row }));
    };
    table.deleteRow = (id) => {
      // Update row order
      table.setRowOrder((prev) => prev.filter((rowId) => rowId !== id));
      // Update table data
      table.setTableData((prev) => {
        const { [id]: _, ...data } = prev;
        return data;
      });
    };
    table.updateRowIcon = (id, icon) => {
      const row = { ...table.getRow(id).original, icon: icon ?? undefined };
      const colId = table
        .getState()
        .columnOrder.find(
          (propId) => table.getColumnPlugin(propId).id === "title",
        )!;
      const cell = row.properties[colId] as Cell<TitlePlugin> | undefined;
      if (!cell) {
        throw new Error(
          `[TableView] Cell not found for row: ${id} at column ${colId}`,
        );
      }
      row.properties[colId] = {
        ...cell,
        value: { ...cell.value, icon: icon ?? undefined },
      };
      table.setTableData((prev) => ({ ...prev, [id]: row }));
    };
  },
  createColumn: (column, table): void => {
    /** Cell */
    column.getCell = (rowId) => table.getCell(column.id, rowId);
    column.updateCell = (rowId, data) => {
      table.updateCell(rowId, column.id, data);
    };
  },
};
