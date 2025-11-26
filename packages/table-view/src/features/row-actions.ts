import type { DragEndEvent } from "@dnd-kit/core";
import {
  functionalUpdate,
  type OnChangeFn,
  type Table,
  type TableFeature,
  type Updater,
} from "@tanstack/react-table";
import { v4 } from "uuid";

import type { IconData } from "@notion-kit/icon-block";

import type { Cell, Row } from "../lib/types";
import { getDefaultCell, insertAt } from "../lib/utils";
import type { CellPlugin, InferData } from "../plugins";
import { TitlePlugin } from "../plugins/title";
import { createDragEndUpdater } from "./utils";

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
    updater: Updater<Cell<TPlugin>>,
  ) => void;
  // Row API
  addRow: (payload?: { id: string; at?: "prev" | "next" }) => void;
  duplicateRow: (id: string) => void;
  deleteRow: (id: string) => void;
  handleRowDragEnd: (e: DragEndEvent) => void;
  updateRowIcon: (id: string, icon: IconData | null) => void;
  // With Grouping API
  addRowToGroup: <TPlugin extends CellPlugin>(payload: {
    groupId: string;
    value: InferData<TPlugin>;
  }) => void;
}

export interface RowActionsColumnApi {
  // Cell updater
  getCell: <TPlugin extends CellPlugin>(rowId: string) => Cell<TPlugin>;
  updateCell: <TPlugin extends CellPlugin>(
    rowId: string,
    updater: Updater<InferData<TPlugin>>,
  ) => void;
}

export interface RowActionsRowApi {
  getIsFirstChild: () => boolean;
  getIsLastChild: () => boolean;
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
    table.updateCell = (rowId, colId, updater) => {
      table.setTableData((prev) => {
        const now = Date.now();
        return prev.map((row) => {
          if (row.id !== rowId) return row;
          const data = functionalUpdate(updater, row.properties[colId]!);
          return {
            ...row,
            properties: { ...row.properties, [colId]: data },
            lastEditedAt: now,
          };
        });
      });
    };
    /** Row API */
    table.addRow = (payload) => {
      const rowId = v4();
      table.setTableData((prev) => {
        const now = Date.now();
        const row: Row = {
          id: rowId,
          properties: {},
          createdAt: now,
          lastEditedAt: now,
        };
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
      table.setTableData((prev) => {
        const idx = prev.findIndex((row) => row.id === id);
        if (idx < 0) return prev;
        const now = Date.now();
        const src = prev[idx]!;
        const properties = Object.fromEntries(
          Object.entries(src.properties).map(([colId, cell]) => [
            colId,
            { ...cell, id: v4() },
          ]),
        );
        return insertAt(
          prev,
          { ...src, id: rowId, properties, createdAt: now, lastEditedAt: now },
          idx + 1,
        );
      });
    };
    table.deleteRow = (id) => {
      table.setTableData((prev) => prev.filter((row) => row.id !== id));
    };
    table.handleRowDragEnd = (e) => {
      table.setTableData(createDragEndUpdater(e, (v) => v.id));
    };
    table.updateRowIcon = (id, icon) => {
      const colId = table
        .getState()
        .columnOrder.find(
          (propId) => table.getColumnPlugin(propId).id === "title",
        )!;
      table.setTableData((prev) => {
        const now = Date.now();
        return prev.map((row) => {
          if (row.id !== id) return row;
          const cell = row.properties[colId] as Cell<TitlePlugin> | undefined;
          if (!cell) return row;
          return {
            ...row,
            icon: icon ?? undefined,
            lastEditedAt: now,
          };
        });
      });
    };
    // With Grouping API
    table.addRowToGroup = (payload) => {
      const rowId = v4();
      const { groupId, value } = payload;
      table.setTableData((prev) => {
        const now = Date.now();
        const row: Row = {
          id: rowId,
          properties: {},
          createdAt: now,
          lastEditedAt: now,
        };
        table.getState().columnOrder.forEach((colId) => {
          const plugin = table.getColumnPlugin(colId);
          row.properties[colId] =
            colId === groupId
              ? { id: v4(), value: structuredClone(value) }
              : getDefaultCell(plugin);
        });
        // Here we simply append the new row to the end.
        // Actual implementation may vary based on grouping logic.
        return [...prev, row];
      });
    };
  },
  createColumn: (column, table): void => {
    /** Cell */
    column.getCell = (rowId) => table.getCell(column.id, rowId);
    column.updateCell = <TPlugin extends CellPlugin>(
      rowId: string,
      updater: Updater<InferData<TPlugin>>,
    ) =>
      table.updateCell<TPlugin>(rowId, column.id, (prev) => ({
        ...prev,
        value: functionalUpdate(updater, prev.value),
      }));
  },
  createRow: (row): void => {
    row.getIsFirstChild = () => {
      const parent = row.getParentRow();
      if (!parent) return false;
      return parent.subRows[0]?.id === row.id;
    };
    row.getIsLastChild = () => {
      const parent = row.getParentRow();
      if (!parent) return false;
      return parent.subRows.at(-1)?.id === row.id;
    };
  },
};
