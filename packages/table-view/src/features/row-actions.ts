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
  getTitleCell: (rowId: string) => { colId: string; cell: Cell<TitlePlugin> };
  updateCell: <TPlugin extends CellPlugin>(
    rowId: string,
    colId: string,
    updater: Updater<Cell<TPlugin>>,
  ) => void;
  // Row API
  addRow: (payload?: { id: string; at?: "prev" | "next" }) => void;
  duplicateRow: (id: string) => void;
  deleteRow: (id: string) => void;
  deleteRows: (ids: string[]) => void;
  handleRowDragEnd: (e: DragEndEvent) => void;
  updateRowIcon: (id: string, icon: IconData | null) => void;
  // With Grouping API
  addRowToGroup: (groupId: string) => void;
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
  getTitleCell: () => { colId: string; cell: Cell<TitlePlugin> };
  getIsFirstChild: () => boolean;
  getIsLastChild: () => boolean;
}

export const RowActionsFeature: TableFeature = {
  getDefaultOptions: (): RowActionsOptions => {
    return {};
  },
  createTable: (table: Table<Row>) => {
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
    table.getTitleCell = (rowId) => {
      const { columnOrder } = table.getState();
      const cells = table.getRow(rowId).original.properties;
      for (const colId of columnOrder) {
        const plugin = table.getColumnPlugin(colId);
        if (plugin.id === "title") {
          return { colId, cell: cells[colId] as Cell<TitlePlugin> };
        }
      }
      throw new Error(`[TableView] Title cell not found: ${rowId}`);
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
    table.deleteRows = (ids) => {
      const idSet = new Set(ids);
      table.setTableData((prev) => prev.filter((row) => !idSet.has(row.id)));
    };
    table.handleRowDragEnd = (e) => {
      const { grouping, groupingState } = table.getState();

      table.setTableData((v) => {
        const updater = createDragEndUpdater<Row>(e, (d) => d.id);
        const next = functionalUpdate(updater, v);

        const groupId = e.over?.data.current?.groupId as string | undefined;
        if (!groupId) return next;

        // If moved into a group, we need to update the grouping cell value.
        const now = Date.now();
        return next.map((row) => {
          if (row.id !== e.active.id || !grouping[0]) return row;
          return {
            ...row,
            properties: {
              ...row.properties,
              [grouping[0]]: {
                id: v4(),
                value: structuredClone<unknown>(
                  groupingState.groupValues[groupId]?.original,
                ),
              },
            },
            lastEditedAt: now,
          };
        });
      });
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
    table.addRowToGroup = (groupId) => {
      const { columnOrder, grouping, groupingState } = table.getState();
      const rowId = v4();
      table.setTableData((v) => {
        const now = Date.now();
        const row: Row = {
          id: rowId,
          properties: {},
          createdAt: now,
          lastEditedAt: now,
        };
        columnOrder.forEach((colId) => {
          const plugin = table.getColumnPlugin(colId);
          row.properties[colId] =
            colId === grouping[0]
              ? {
                  id: v4(),
                  value: structuredClone<unknown>(
                    groupingState.groupValues[groupId]?.original,
                  ),
                }
              : getDefaultCell(plugin);
        });
        // Here we simply append the new row to the end.
        // Actual implementation may vary based on grouping logic.
        return [...v, row];
      });
    };
  },
  createColumn: (column, table) => {
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
  createRow: (row, table) => {
    row.getTitleCell = () => {
      return table.getTitleCell(row.id);
    };
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
