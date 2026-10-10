import type { TableFeature, Updater } from "@tanstack/react-table";
import { functionalUpdate } from "@tanstack/react-table";
import { v4 } from "uuid";

import type {
  CellPlugin,
  InferData,
  TitlePlugin,
} from "@notion-kit/table-hook/plugins";
import type { IconData } from "@notion-kit/ui/icon-block";

import { pruneRowSelection } from "@/features/row-selection";
import type { _TableInstance } from "@/features/types";
import { createGroupId } from "@/features/utils";
import type { Cell, Row } from "@/lib/types";
import { getDefaultCell, insertAt } from "@/lib/utils";
import type { DataResourceAction, ResourceChangeFn } from "@/table-contexts";
import { createRuntimePluginMethodContext } from "@/table-contexts/plugin-method-context";

export interface RowActionsOptions {
  onTableDataChange?: ResourceChangeFn<Row[], DataResourceAction>;
}

export interface MoveRowOptions {
  rowId: string;
  groupId?: string;
  beforeRowId: string | null;
}

export interface AddRowOptions {
  id?: string;
  at?: "prev" | "next";
  initialValues?: Record<string, unknown>;
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
  updateCells: <TPlugin extends CellPlugin>(
    rowIds: string[],
    colId: string,
    value: InferData<TPlugin>,
  ) => void;
  // Row API
  addRow: (options?: AddRowOptions) => string;
  duplicateRow: (id: string) => void;
  duplicateRows: (ids: string[]) => void;
  deleteRow: (id: string) => void;
  deleteRows: (ids: string[]) => void;
  moveRow: (intent: MoveRowOptions) => void;
  getCanMoveRowToGroup: (rowId: string, groupId: string) => boolean;
  updateRowIcon: (id: string, icon: IconData | null) => void;
  // With Grouping API
  addRowToGroup: (groupId: string) => void;
}

export interface RowActionsColumnApi {
  // Cell updater
  getCell: <TPlugin extends CellPlugin>(rowId: string) => Cell<TPlugin>;
  getSelectedRowIds: () => string[];
  updateCell: <TPlugin extends CellPlugin>(
    rowId: string,
    updater: Updater<InferData<TPlugin>>,
    originalGroupId?: string,
  ) => void;
  updateCells: <TPlugin extends CellPlugin>(
    rowIds: string[],
    value: InferData<TPlugin>,
  ) => void;
}

export interface RowActionsRowApi {
  getTitleCell: () => { colId: string; cell: Cell<TitlePlugin> };
  getIsFirstChild: () => boolean;
  getIsLastChild: () => boolean;
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
    const scheduleGroupingStateSync = (rows: Row[]) => {
      if (table.atoms.grouping.get().length > 0) {
        queueMicrotask(() => {
          table._syncGroupingStateFromData(rows);
        });
      }
    };

    table.setTableData = (updater, action) =>
      table.options.onTableDataChange?.((previous) => {
        const next = functionalUpdate(updater, previous);
        table.baseAtoms.rowSelection.set((selection) =>
          pruneRowSelection(selection, next),
        );
        return next;
      }, action);
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
      const columnOrder = table.atoms.columnOrder.get();
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
    table.updateCells = <TPlugin extends CellPlugin>(
      rowIds: string[],
      colId: string,
      value: InferData<TPlugin>,
    ) => {
      const rowIdSet = new Set(rowIds);
      const actionId = v4();
      table.setTableData(
        (previous) => {
          const targetRows = previous.filter(
            (row) => rowIdSet.has(row.id) && row.properties[colId],
          );
          if (targetRows.length === 0) return previous;

          const now = Date.now();
          const next = previous.map((row) => {
            const currentCell = row.properties[colId];
            if (!rowIdSet.has(row.id) || !currentCell) return row;

            return {
              ...row,
              properties: {
                ...row.properties,
                [colId]: { ...currentCell, value },
              },
              lastEditedAt: now,
            };
          });

          scheduleGroupingStateSync(next);

          return next;
        },
        (previous) => ({
          id: actionId,
          type: "data.cell.update",
          payload: {
            rowIds: previous.flatMap((row) =>
              rowIdSet.has(row.id) && row.properties[colId] ? [row.id] : [],
            ),
            propertyId: colId,
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
          table.atoms.columnOrder.get().forEach((colId) => {
            const plugin = table.getColumnPlugin(colId);
            const cell = getDefaultCell(plugin);
            if (
              payload?.initialValues &&
              Object.hasOwn(payload.initialValues, colId)
            ) {
              cell.value = payload.initialValues[colId];
            }
            row.properties[colId] = cell;
          });
          if (payload?.id === undefined) {
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
      return rowId;
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
    table.duplicateRows = (ids) => {
      const idSet = new Set(ids);
      const actionId = v4();
      table.setTableData(
        (previous) => {
          const sourceRows = previous.filter((row) => idSet.has(row.id));
          if (sourceRows.length === 0) return previous;

          const now = Date.now();
          const next = previous.flatMap((row) => {
            if (!idSet.has(row.id)) return [row];

            const properties = Object.fromEntries(
              Object.entries(row.properties).map(([colId, cell]) => [
                colId,
                { ...cell, id: v4() },
              ]),
            );
            return [
              row,
              {
                ...row,
                id: v4(),
                properties,
                createdAt: now,
                lastEditedAt: now,
              },
            ];
          });

          scheduleGroupingStateSync(next);

          return next;
        },
        (previous, next) => ({
          id: actionId,
          type: "data.rows.duplicate",
          payload: {
            duplicates: previous.flatMap((sourceRow) => {
              if (!idSet.has(sourceRow.id)) return [];
              const sourcePosition = getRowPosition(next, sourceRow.id);
              const duplicateRow = next[sourcePosition + 1];
              if (!duplicateRow) return [];
              return [
                {
                  sourceRowId: sourceRow.id,
                  rowId: duplicateRow.id,
                  nextPosition: sourcePosition + 1,
                },
              ];
            }),
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
    const getDestinationRow = (row: Row, groupId: string) => {
      if (table.getTableGlobalState().locked) return null;
      const info = table.getGroupedColumnInfo();
      if (!info) return null;
      const state = table.atoms.groupingState.get();
      const destination = state.groupValues[groupId];
      if (!destination || state.groupVisibility[groupId] === false) return null;
      const plugin = table.getColumnPlugin(info.id);
      const method = table.getSelectedGroupingMethod(info.id);
      const context = createRuntimePluginMethodContext(
        table,
        info.id,
        info.config,
        table.options.weekStartsOn ?? 1,
      );
      const cell = row.properties[info.id];
      const data: unknown = cell ? cell.value : plugin.default.data;
      const classify = (value: unknown, source: Row) =>
        createGroupId(
          info.id,
          plugin.isEmpty(value)
            ? null
            : method.function(value, source, info.id, context),
        );
      if (classify(data, row) === groupId) return row;
      if (!cell || !method.getDropValue) return null;
      const value = method.getDropValue(data, destination.value, context);
      const next = {
        ...row,
        properties: { ...row.properties, [info.id]: { ...cell, value } },
        lastEditedAt: Date.now(),
      };
      return classify(value, next) === groupId ? next : null;
    };
    table.getCanMoveRowToGroup = (rowId, groupId) => {
      const row = table.options.data.find(
        (candidate) => candidate.id === rowId,
      );
      return !!row && getDestinationRow(row, groupId) !== null;
    };
    table.moveRow = ({ rowId, groupId, beforeRowId }) => {
      const actionId = v4();
      table.setTableData(
        (rows) => {
          if (table.getTableGlobalState().locked || beforeRowId === rowId)
            return rows;
          const source = rows.find((row) => row.id === rowId);
          if (!source || !table.getRowModel().rowsById[rowId]) return rows;
          const moved =
            groupId === undefined ? source : getDestinationRow(source, groupId);
          if (!moved) return rows;
          const remaining = rows.filter((row) => row.id !== rowId);
          const info = table.getGroupedColumnInfo();
          const method = info ? table.getSelectedGroupingMethod(info.id) : null;
          const plugin = info ? table.getColumnPlugin(info.id) : null;
          const context = info
            ? createRuntimePluginMethodContext(
                table,
                info.id,
                info.config,
                table.options.weekStartsOn ?? 1,
              )
            : null;
          const belongs = (row: Row) => {
            if (groupId === undefined) return true;
            if (!info || !method || !plugin || !context) return false;
            const cell = row.properties[info.id];
            const value: unknown = cell ? cell.value : plugin.default.data;
            return (
              createGroupId(
                info.id,
                plugin.isEmpty(value)
                  ? null
                  : method.function(value, row, info.id, context),
              ) === groupId
            );
          };
          let index = remaining.length;
          if (beforeRowId !== null) {
            const anchor = remaining.find((row) => row.id === beforeRowId);
            if (
              !anchor ||
              !belongs(anchor) ||
              !table.getRowModel().rowsById[beforeRowId]
            )
              return rows;
            index = remaining.indexOf(anchor);
          } else if (groupId !== undefined) {
            let last = -1;
            remaining.forEach((row, position) => {
              if (belongs(row)) last = position;
            });
            if (last >= 0) index = last + 1;
          }
          if (moved === source && groupId !== undefined) {
            const currentGroup = rows.filter(belongs);
            const proposedGroup = remaining.filter(belongs);
            const groupIndex =
              beforeRowId === null
                ? proposedGroup.length
                : proposedGroup.findIndex((row) => row.id === beforeRowId);
            proposedGroup.splice(groupIndex, 0, moved);
            if (
              proposedGroup.every(
                (row, position) => row === currentGroup[position],
              )
            )
              return rows;
          }
          const next = insertAt(remaining, moved, index);
          return moved === source &&
            next.every((row, position) => row === rows[position])
            ? rows
            : next;
        },
        (previous, next) => {
          const propertyId = table.atoms.grouping.get()[0];
          const previousRow = previous.find((row) => row.id === rowId);
          const nextRow = next.find((row) => row.id === rowId);
          const previousValue: unknown = propertyId
            ? previousRow?.properties[propertyId]?.value
            : undefined;
          const nextValue: unknown = propertyId
            ? nextRow?.properties[propertyId]?.value
            : undefined;
          const grouping =
            propertyId && previousValue !== nextValue
              ? {
                  propertyId,
                  previousValue,
                  nextValue,
                }
              : undefined;
          return {
            id: actionId,
            type: "data.row.move",
            payload: {
              rowId,
              previousPosition: getRowPosition(previous, rowId),
              nextPosition: getRowPosition(next, rowId),
              ...(grouping ? { grouping } : {}),
            },
          };
        },
      );
    };
    table.updateRowIcon = (id, icon) => {
      const colId = table.atoms.columnOrder
        .get()
        .find((propId) => table.getColumnPlugin(propId).id === "title");
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
      const columnOrder = table.atoms.columnOrder.get();
      const grouping = table.atoms.grouping.get();
      const groupingState = table.atoms.groupingState.get();
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
    prototype.getSelectedRowIds = () => table.getSelectedRowIds();
    prototype.updateCell = function <TPlugin extends CellPlugin>(
      this: { id: string },
      rowId: string,
      updater: Updater<InferData<TPlugin>>,
      originalGroupId?: string,
    ) {
      if (table.getTableGlobalState().locked) return;
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
    prototype.updateCells = function <TPlugin extends CellPlugin>(
      this: { id: string },
      rowIds: string[],
      value: InferData<TPlugin>,
    ) {
      if (table.getTableGlobalState().locked) return;
      table.updateCells<TPlugin>(rowIds, this.id, value);
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
