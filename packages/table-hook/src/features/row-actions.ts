import type { DragEndEvent, DragOverEvent } from "@dnd-kit/react";
import type { TableFeature, Updater } from "@tanstack/react-table";
import { functionalUpdate } from "@tanstack/react-table";
import { v4 } from "uuid";

import type { IconData } from "@notion-kit/ui/icon-block";
import {
  getKanbanColumnTargetId,
  getKanbanItemsAfterDrag,
  type KanbanItems,
} from "@notion-kit/ui/kanban";
import { getSortableItemsAfterDrag } from "@notion-kit/ui/primitives";

import type { _TableInstance } from "@/features/types";
import { createGroupId } from "@/features/utils";
import type { Cell, Row } from "@/lib/types";
import { getDefaultCell, insertAt } from "@/lib/utils";
import type {
  CellPlugin,
  ComparableValue,
  InferData,
  TitlePlugin,
} from "@/plugins";
import type { DataResourceAction, ResourceChangeFn } from "@/table-contexts";

export interface RowActionsOptions {
  onTableDataChange?: ResourceChangeFn<Row[], DataResourceAction>;
}

export interface RowDragEndOptions {
  reorder?: boolean;
}

export interface RowActionsTableApi {
  setTableData: ResourceChangeFn<Row[], DataResourceAction>;
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
    originalGroupId?: string,
  ) => void;
  // Row API
  addRow: (payload?: { id: string; at?: "prev" | "next" }) => void;
  duplicateRow: (id: string) => void;
  deleteRow: (id: string) => void;
  deleteRows: (ids: string[]) => void;
  handleKanbanRowDragOver: (e: DragOverEvent) => void;
  handleRowDragEnd: (e: DragEndEvent, options?: RowDragEndOptions) => void;
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
    originalGroupId?: string,
  ) => void;
}

export interface RowActionsRowApi {
  getTitleCell: () => { colId: string; cell: Cell<TitlePlugin> };
  getIsFirstChild: () => boolean;
  getIsLastChild: () => boolean;
}

function getRowGroupingValue(
  table: _TableInstance,
  row: Row,
  groupingColumnId: string,
): ComparableValue | null {
  const cell = row.properties[groupingColumnId];
  if (!cell) return null;

  const plugin = table.getColumnPlugin(groupingColumnId);
  return (plugin.toGroupValue ?? plugin.toValue)(cell.value, row);
}

function createKanbanItemsFromRows(
  table: _TableInstance,
  rows: Row[],
  groupingColumnId: string,
  groupOrder: string[],
): KanbanItems {
  const items = Object.fromEntries(
    groupOrder.map((groupId) => [groupId, [] as string[]]),
  );

  for (const row of rows) {
    const groupingValue = getRowGroupingValue(table, row, groupingColumnId);
    const groupId = createGroupId(groupingColumnId, groupingValue);
    items[groupId]?.push(row.id);
  }

  return items;
}

function applyKanbanItemsToRows(
  rows: Row[],
  items: KanbanItems,
  groupOrder: string[],
  groupingColumnId: string,
  groupValues: Record<string, { original: unknown } | undefined>,
  options: { touchMovedRow?: boolean } = {},
) {
  const rowById = new Map(rows.map((row) => [row.id, row]));
  const nextRows: Row[] = [];
  const consumedIds = new Set<string>();
  const now = Date.now();

  for (const groupId of groupOrder) {
    const groupValue = groupValues[groupId];
    const itemIds = items[groupId] ?? [];
    for (const itemId of itemIds) {
      const row = rowById.get(itemId);
      if (!row) continue;

      consumedIds.add(itemId);
      if (!groupValue || !row.properties[groupingColumnId]) {
        nextRows.push(row);
        continue;
      }

      nextRows.push({
        ...row,
        properties: {
          ...row.properties,
          [groupingColumnId]: {
            ...row.properties[groupingColumnId],
            id: options.touchMovedRow
              ? v4()
              : row.properties[groupingColumnId].id,
            value: structuredClone(groupValue.original),
          },
        },
        lastEditedAt: options.touchMovedRow ? now : row.lastEditedAt,
      });
    }
  }

  return [...nextRows, ...rows.filter((row) => !consumedIds.has(row.id))];
}

function getRowPosition(rows: Row[], rowId: string) {
  return rows.findIndex((row) => row.id === rowId);
}

export const RowActionsFeature: TableFeature = {
  getDefaultTableOptions: (): RowActionsOptions => {
    return {};
  },
  constructTableAPIs: (_table) => {
    const table = _table as unknown as _TableInstance;
    let kanbanDragSnapshot: Row[] | null = null;

    const scheduleGroupingStateSync = (rows: Row[]) => {
      if (table.store.state.grouping.length > 0) {
        queueMicrotask(() => {
          table._syncGroupingStateFromData(rows);
        });
      }
    };

    table.setTableData = (updater, action) =>
      table.options.onTableDataChange?.(updater, action);
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
      const { columnOrder } = table.store.state;
      const cells = table.getRow(rowId).original.properties;
      for (const colId of columnOrder) {
        const plugin = table.getColumnPlugin(colId);
        if (plugin.id === "title") {
          return { colId, cell: cells[colId] as Cell<TitlePlugin> };
        }
      }
      throw new Error(`[TableView] Title cell not found: ${rowId}`);
    };
    table.updateCell = <TPlugin extends CellPlugin>(
      rowId: string,
      colId: string,
      updater: Updater<Cell<TPlugin>>,
      _originalGroupId?: string,
    ) => {
      const actionId = v4();
      table.setTableData(
        (prev) => {
          const now = Date.now();
          const next = prev.map((row) => {
            if (row.id !== rowId) return row;
            const currentCell = row.properties[colId];
            if (!currentCell) return row;
            const data = functionalUpdate(
              updater,
              currentCell as Cell<TPlugin>,
            );
            return {
              ...row,
              properties: { ...row.properties, [colId]: data },
              lastEditedAt: now,
            };
          });

          scheduleGroupingStateSync(next);

          return next;
        },
        (previous, next) => ({
          id: actionId,
          type: "data.cell.update",
          payload: {
            rowId,
            propertyId: colId,
            previousValue: previous.find((row) => row.id === rowId)?.properties[
              colId
            ]?.value,
            nextValue: next.find((row) => row.id === rowId)?.properties[colId]
              ?.value,
          },
        }),
      );
    };
    /** Row API */
    table.addRow = (payload) => {
      const rowId = v4();
      const actionId = v4();
      table.setTableData(
        (prev) => {
          const now = Date.now();
          const row: Row = {
            id: rowId,
            properties: {},
            createdAt: now,
            lastEditedAt: now,
          };
          table.store.state.columnOrder.forEach((colId) => {
            const plugin = table.getColumnPlugin(colId);
            row.properties[colId] = getDefaultCell(plugin);
          });
          if (payload === undefined) {
            const next = [...prev, row];
            scheduleGroupingStateSync(next);
            return next;
          }
          const idx = prev.findIndex((row) => row.id === payload.id);
          const next =
            payload.at === "next"
              ? insertAt(prev, row, idx + 1)
              : insertAt(prev, row, idx);
          scheduleGroupingStateSync(next);
          return next;
        },
        (_previous, next) => ({
          id: actionId,
          type: "data.row.create",
          payload: {
            rowId,
            nextPosition: getRowPosition(next, rowId),
          },
        }),
      );
    };
    table.duplicateRow = (id) => {
      const rowId = v4();
      const actionId = v4();
      table.setTableData(
        (prev) => {
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
          const next = insertAt(
            prev,
            {
              ...src,
              id: rowId,
              properties,
              createdAt: now,
              lastEditedAt: now,
            },
            idx + 1,
          );
          scheduleGroupingStateSync(next);
          return next;
        },
        (_previous, next) => ({
          id: actionId,
          type: "data.row.duplicate",
          payload: {
            sourceRowId: id,
            rowId,
            nextPosition: getRowPosition(next, rowId),
          },
        }),
      );
    };
    table.deleteRow = (id) => {
      table.deleteRows([id]);
    };
    table.deleteRows = (ids) => {
      const idSet = new Set(ids);
      const actionId = v4();
      table.setTableData(
        (prev) => {
          const next = prev.filter((row) => !idSet.has(row.id));
          scheduleGroupingStateSync(next);
          return next;
        },
        (previous) => ({
          id: actionId,
          type: "data.row.delete",
          payload: {
            rowIds: ids,
            previousPositions: ids.map((rowId) => ({
              rowId,
              index: getRowPosition(previous, rowId),
            })),
          },
        }),
      );
    };
    table.handleKanbanRowDragOver = (event) => {
      if ("canceled" in event && event.canceled) return;

      const { grouping, groupingState } = table.store.state;
      const groupingColumnId = grouping[0];
      if (!groupingColumnId) return;

      const sourceRowId = String(event.operation.source?.id ?? "");
      const actionId = v4();
      table.setTableData(
        (rows) => {
          const currentItems = createKanbanItemsFromRows(
            table,
            rows,
            groupingColumnId,
            groupingState.groupOrder,
          );
          const nextItems = getKanbanItemsAfterDrag(currentItems, event);
          if (nextItems === currentItems) return rows;
          kanbanDragSnapshot ??= rows;

          const next = applyKanbanItemsToRows(
            rows,
            nextItems,
            groupingState.groupOrder,
            groupingColumnId,
            groupingState.groupValues,
          );
          scheduleGroupingStateSync(next);
          return next;
        },
        (previous, next) => ({
          id: actionId,
          type: "data.row.move",
          payload: {
            rowId: sourceRowId,
            previousPosition: getRowPosition(previous, sourceRowId),
            nextPosition: getRowPosition(next, sourceRowId),
          },
        }),
      );
    };
    table.handleRowDragEnd = (event, options = {}) => {
      if (event.canceled) {
        if (kanbanDragSnapshot) {
          const snapshot = kanbanDragSnapshot;
          const sourceRowId = String(event.operation.source?.id ?? "");
          kanbanDragSnapshot = null;
          table.setTableData(
            () => {
              scheduleGroupingStateSync(snapshot);
              return snapshot;
            },
            (previous, next) => ({
              id: v4(),
              type: "data.row.move",
              payload: {
                rowId: sourceRowId,
                previousPosition: getRowPosition(previous, sourceRowId),
                nextPosition: getRowPosition(next, sourceRowId),
              },
            }),
          );
        }
        return;
      }
      kanbanDragSnapshot = null;

      const { grouping, groupingState } = table.store.state;
      const groupingColumnId = grouping[0];
      const { source, target } = event.operation;
      const sourceGroupId = getKanbanColumnTargetId(source?.data);
      const targetGroupId = getKanbanColumnTargetId(target?.data);
      const shouldReorder = options.reorder ?? true;

      const sourceRowId = String(source?.id ?? "");
      const actionId = v4();
      table.setTableData(
        (rows) => {
          const next = shouldReorder
            ? getSortableItemsAfterDrag(rows, event)
            : rows;
          if (
            !source ||
            !targetGroupId ||
            targetGroupId === sourceGroupId ||
            !groupingColumnId
          ) {
            scheduleGroupingStateSync(next);
            return next;
          }

          const now = Date.now();
          const updated = next.map((row) => {
            if (row.id !== String(source.id)) return row;
            return {
              ...row,
              properties: {
                ...row.properties,
                [groupingColumnId]: {
                  id: v4(),
                  value: structuredClone<unknown>(
                    groupingState.groupValues[targetGroupId]?.original,
                  ),
                },
              },
              lastEditedAt: now,
            };
          });
          scheduleGroupingStateSync(updated);
          return updated;
        },
        (previous, next) => ({
          id: actionId,
          type: "data.row.move",
          payload: {
            rowId: sourceRowId,
            previousPosition: getRowPosition(previous, sourceRowId),
            nextPosition: getRowPosition(next, sourceRowId),
          },
        }),
      );
    };
    table.updateRowIcon = (id, icon) => {
      const colId = table.store.state.columnOrder.find(
        (propId) => table.getColumnPlugin(propId).id === "title",
      );
      if (!colId) return;
      const actionId = v4();
      table.setTableData(
        (prev) => {
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
        },
        (previous, next) => ({
          id: actionId,
          type: "data.row.update",
          payload: {
            rowId: id,
            previous: { icon: previous.find((row) => row.id === id)?.icon },
            next: { icon: next.find((row) => row.id === id)?.icon },
          },
        }),
      );
    };
    // With Grouping API
    table.addRowToGroup = (groupId) => {
      const { columnOrder, grouping, groupingState } = table.store.state;
      const rowId = v4();
      const actionId = v4();
      table.setTableData(
        (v) => {
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
          const next = [...v, row];
          scheduleGroupingStateSync(next);
          return next;
        },
        (_previous, next) => ({
          id: actionId,
          type: "data.row.create",
          payload: {
            rowId,
            nextPosition: getRowPosition(next, rowId),
            groupId,
          },
        }),
      );
    };
  },
  assignColumnPrototype: (prototype, _table) => {
    const table = _table as unknown as _TableInstance;

    /** Cell */
    prototype.getCell = function (this: { id: string }, rowId: string) {
      return table.getCell(this.id, rowId);
    };
    prototype.updateCell = function <TPlugin extends CellPlugin>(
      this: { id: string },
      rowId: string,
      updater: Updater<InferData<TPlugin>>,
      originalGroupId?: string,
    ) {
      table.updateCell<TPlugin>(
        rowId,
        this.id,
        (prev) => ({
          ...prev,
          value: functionalUpdate(updater, prev.value),
        }),
        originalGroupId,
      );
    };
  },
  assignRowPrototype: (prototype, _table) => {
    const table = _table as unknown as _TableInstance;

    prototype.getTitleCell = function (this: { id: string }) {
      return table.getTitleCell(this.id);
    };
    prototype.getIsFirstChild = function (this: {
      id: string;
      getParentRow: () => { subRows: { id: string }[] } | undefined;
    }) {
      const parent = this.getParentRow();
      if (!parent) return false;
      return parent.subRows[0]?.id === this.id;
    };
    prototype.getIsLastChild = function (this: {
      id: string;
      getParentRow: () => { subRows: { id: string }[] } | undefined;
    }) {
      const parent = this.getParentRow();
      if (!parent) return false;
      return parent.subRows.at(-1)?.id === this.id;
    };
  },
};
