import type { OnChangeFn, Table, TableFeature } from "@tanstack/react-table";
import { v4 } from "uuid";

import type { IconData } from "@notion-kit/icon-block";

import type { Cell, Row } from "../lib/types";
import { getDefaultCell, insertAt } from "../lib/utils";
import type { CellPlugin } from "../plugins";
import { TitlePlugin } from "../plugins/title";

export interface RowActionsOptions {
  onTableDataChange?: OnChangeFn<Row[]>;
}

export interface RowActionsTableApi {
  setTableData: OnChangeFn<Row[]>;
  // Cell API
  getCellValues: <TPlugins extends CellPlugin[]>() => Row<TPlugins>[];
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
  getDefaultOptions: (): RowActionsOptions => {
    return {};
  },
  createTable: (table: Table<Row>): void => {
    table.setTableData = (updater) =>
      table.options.onTableDataChange?.(updater);
    /** Cell API */
    table.getCellValues = () =>
      table.getCoreRowModel().rows.map((row) => row.original);
    table.getCell = (colId, rowId) => {
      const cell = table.getRow(rowId).original.properties[colId];
      if (!cell) {
        throw new Error(`[TableView] Cell not found: ${rowId}, ${colId}`);
      }
      return cell;
    };
    table.updateCell = (rowId, colId, data) => {
      table.setTableData((prev) => {
        return prev.map((row) => {
          if (row.id !== rowId) return row;
          return {
            ...row,
            properties: { ...row.properties, [colId]: data },
          };
        });
      });
    };
    /** Row API */
    table.addRow = (payload) => {
      const rowId = v4();
      // Update row order
      table.setRowOrder((prev) => {
        if (payload === undefined) return [...prev, rowId];
        const idx = prev.indexOf(payload.id);
        return payload.at === "next"
          ? insertAt(prev, rowId, idx + 1)
          : insertAt(prev, rowId, idx);
      });
      // Update table data
      table.setTableData((prev) => {
        const row: Row = { id: rowId, properties: {} };
        table.getState().columnOrder.forEach((colId) => {
          const plugin = table.getColumnPlugin(colId);
          row.properties[colId] = getDefaultCell(plugin);
        });
        if (payload === undefined) return [...prev, row];
        const idx = prev.findIndex((row) => row.id === payload.id);
        return payload.at === "next"
          ? insertAt(prev, row, idx + 1)
          : insertAt(prev, row, idx);
      });
    };
    table.duplicateRow = (id) => {
      const rowId = v4();
      // Update row order
      table.setRowOrder((prev) => {
        const idx = prev.indexOf(id);
        if (idx < 0) return prev;
        return insertAt(prev, rowId, idx + 1);
      });
      // Update table data
      table.setTableData((prev) => {
        const idx = prev.findIndex((row) => row.id === id);
        if (idx < 0) return prev;
        const src = prev[idx]!;
        const properties = Object.fromEntries(
          Object.entries(src.properties).map(([colId, cell]) => [
            colId,
            { ...cell, id: v4() },
          ]),
        );
        return insertAt(prev, { ...src, id: rowId, properties }, idx + 1);
      });
    };
    table.deleteRow = (id) => {
      // Update row order
      table.setRowOrder((prev) => prev.filter((rowId) => rowId !== id));
      // Update table data
      table.setTableData((prev) => prev.filter((row) => row.id !== id));
    };
    table.updateRowIcon = (id, icon) => {
      const colId = table
        .getState()
        .columnOrder.find(
          (propId) => table.getColumnPlugin(propId).id === "title",
        )!;
      table.setTableData((prev) => {
        return prev.map((row) => {
          if (row.id !== id) return row;
          const cell = row.properties[colId] as Cell<TitlePlugin> | undefined;
          if (!cell) return row;
          // Create a new cell with updated icon value
          const updatedCell: Cell<TitlePlugin> = {
            ...cell,
            value: {
              ...cell.value,
              icon: icon ?? undefined,
            },
          };
          return {
            ...row,
            icon: icon ?? undefined,
            properties: { ...row.properties, [colId]: updatedCell },
          };
        });
      });
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
