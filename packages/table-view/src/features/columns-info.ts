import type {
  Column,
  OnChangeFn,
  Table,
  TableFeature,
  Updater,
} from "@tanstack/react-table";
import { functionalUpdate, makeStateUpdater } from "@tanstack/react-table";
import { v4 } from "uuid";

import type { ColumnInfo, PluginType, Row } from "../lib/types";
import {
  arrayToEntity,
  getDefaultCell,
  getUniqueName,
  insertAt,
} from "../lib/utils";
import type { CellPlugin, InferActions, InferPlugin } from "../plugins";
import { DEFAULT_PLUGINS } from "../plugins";

export type ColumnsInfoState<TPlugins extends CellPlugin[] = CellPlugin[]> =
  Record<string, ColumnInfo<InferPlugin<TPlugins>>>;

export interface ColumnsInfoTableState {
  cellPlugins: Record<string, CellPlugin>;
  /**
   * @field columns information
   * @param key column id
   */
  columnsInfo: ColumnsInfoState;
}

export interface ColumnsInfoOptions {
  onColumnInfoChange?: OnChangeFn<ColumnsInfoState>;
}

export interface ColumnsInfoTableApi {
  // Column Getters
  getColumnInfo: (colId: string) => ColumnInfo;
  getColumnPlugin: (colId: string) => CellPlugin;
  getDeletedColumns: () => ColumnInfo[];
  countVisibleColumns: () => number;
  // Column Setters
  _setColumnInfo: (colId: string, updater: Updater<ColumnInfo>) => void;
  setColumnInfo: (colId: string, info: Partial<Omit<ColumnInfo, "id">>) => void;
  _addColumnInfo: (info: ColumnInfo) => void;
  addColumnInfo: (payload: {
    id: string;
    name: string;
    type: string;
    at?: {
      id: string;
      side: "left" | "right";
    };
  }) => void;
  duplicateColumnInfo: (colId: string) => void;
  removeColumnInfo: (colId: string) => void;
  toggleColumnWrapped: (colId: string, updater: Updater<boolean>) => void;
  setColumnType: <TPlugins extends CellPlugin[]>(
    colId: string,
    type: PluginType<TPlugins>,
  ) => void;
  setColumnTypeConfig: <TPlugin extends CellPlugin>(
    colId: string,
    actions: InferActions<TPlugin>,
  ) => void;
  // Column name checkers
  checkIsUniqueColumnName: (name: string) => boolean;
  generateUniqueColumnName: (initial?: string) => string;
}

export interface ColumnInfoColumnApi {
  getInfo: () => ColumnInfo;
  getWidth: () => string;
  getPlugin: () => CellPlugin;
  handleResizeEnd: () => void;
}

export const ColumnsInfoFeature: TableFeature<Row> = {
  getInitialState: (state): ColumnsInfoTableState => {
    return {
      cellPlugins: arrayToEntity(DEFAULT_PLUGINS).items,
      columnsInfo: {},
      ...state,
    };
  },

  getDefaultOptions: (table: Table<Row>): ColumnsInfoOptions => {
    return {
      onColumnInfoChange: makeStateUpdater("columnsInfo", table),
    };
  },

  createTable: (table: Table<Row>): void => {
    /** Column Getters */
    table.getColumnInfo = (colId) => {
      const info = table.getState().columnsInfo[colId];
      if (!info) {
        throw new Error(`[TableView] Column info not found: "${colId}"`);
      }
      return info;
    };
    table.getColumnPlugin = (colId) => {
      const type = table.getColumnInfo(colId).type;
      const plugin = table.getState().cellPlugins[type];
      if (!plugin) {
        throw new Error(`[TableView] Plugin not found: ${type}`);
      }
      return plugin;
    };
    table.getDeletedColumns = () => {
      const { columnOrder, columnsInfo } = table.getState();
      return columnOrder.reduce<ColumnInfo[]>((acc, colId) => {
        const info = columnsInfo[colId];
        if (!info?.isDeleted) return acc;
        acc.push({ ...info, id: colId });
        return acc;
      }, []);
    };
    table.countVisibleColumns = () => {
      const { columnsInfo } = table.getState();
      return Object.values(columnsInfo).reduce((acc, info) => {
        if (!info.hidden && !info.isDeleted) acc++;
        return acc;
      }, 0);
    };
    /** Overrides */
    table.toggleAllColumnsVisible = () => {
      const canHide = table.countVisibleColumns() > 1;
      table.getState().columnOrder.forEach((colId) => {
        table._setColumnInfo(colId, (prev) => {
          if (prev.isDeleted) return prev;
          return { ...prev, hidden: prev.type === "title" ? false : canHide };
        });
      });
    };
    /** Column Setters */
    table._setColumnInfo = (colId, updater) => {
      table.options.onColumnInfoChange?.((prev) => ({
        ...prev,
        [colId]: functionalUpdate(updater, prev[colId]!),
      }));
      table.options.sync?.(["header"]);
      // Sync column visibility
      const info = functionalUpdate(updater, table.getColumnInfo(colId));
      if (info.hidden !== undefined || info.isDeleted !== undefined)
        table.setColumnVisibility((prev) => ({
          ...prev,
          [colId]: !info.hidden && !info.isDeleted,
        }));
    };
    table.setColumnInfo = (colId, info) => {
      table._setColumnInfo(colId, (prev) => ({ ...prev, ...info }));
    };
    table._addColumnInfo = (info) => {
      table.options.onColumnInfoChange?.((prev) => ({
        ...prev,
        [info.id]: info,
      }));
    };
    table.addColumnInfo = (payload) => {
      const { cellPlugins, rowOrder } = table.getState();
      const { id, name, type, at } = payload;
      const plugin = cellPlugins[type];
      if (!plugin) {
        throw new Error(`[TableView] Plugin not found: ${type}`);
      }
      table._addColumnInfo({
        id,
        name,
        type,
        config: plugin.default.config as unknown,
      });
      // Update column order
      table.setColumnOrder((prev) => {
        if (at === undefined) return [...prev, id];
        const idx = prev.indexOf(at.id);
        return at.side === "right"
          ? insertAt(prev, id, idx + 1)
          : insertAt(prev, id, idx);
      });
      // Update all rows
      table.setTableData((prev) =>
        rowOrder.reduce(
          (acc, rowId) => {
            if (!prev[rowId]) return acc;
            return {
              ...acc,
              [rowId]: {
                ...prev[rowId],
                properties: {
                  ...prev[rowId].properties,
                  [id]: getDefaultCell(plugin),
                },
              },
            };
          },
          { ...prev },
        ),
      );
    };
    table.duplicateColumnInfo = (colId) => {
      const { columnOrder, rowOrder, cellPlugins } = table.getState();
      const src = table.getColumnInfo(colId);
      const idx = columnOrder.indexOf(colId);
      const newColId = v4();
      table._addColumnInfo({
        ...src,
        id: newColId,
        name: table.generateUniqueColumnName(src.name),
      });
      // Update column order
      table.setColumnOrder((prev) => insertAt(prev, newColId, idx + 1));
      // Update all rows
      table.setTableData((prev) =>
        rowOrder.reduce(
          (acc, rowId) => {
            if (!prev[rowId]) return acc;
            return {
              ...acc,
              [rowId]: {
                ...prev[rowId],
                properties: {
                  ...prev[rowId].properties,
                  [newColId]: getDefaultCell(cellPlugins[src.type]!),
                },
              },
            };
          },
          { ...prev },
        ),
      );
    };
    table.removeColumnInfo = (colId) => {
      table.options.onColumnInfoChange?.((prev) => {
        const { [colId]: _, ...rest } = prev;
        return rest;
      });
      // Update column order
      table.setColumnOrder((prev) => prev.filter((id) => id !== colId));
      // Update all rows
      const { rowOrder } = table.getState();
      table.setTableData((prev) =>
        rowOrder.reduce(
          (acc, rowId) => {
            if (!prev[rowId]) return acc;
            const { [colId]: _, ...properties } = prev[rowId].properties;
            return {
              ...acc,
              [rowId]: { ...prev[rowId], properties },
            };
          },
          { ...prev },
        ),
      );
    };
    table.toggleColumnWrapped = (colId, updater) => {
      table._setColumnInfo(colId, (prev) => ({
        ...prev,
        wrapped: functionalUpdate(updater, prev.wrapped ?? false),
      }));
    };
    table.setColumnType = <TPlugins extends CellPlugin[]>(
      colId: string,
      type: PluginType<TPlugins>,
    ) => {
      const destPlugin = table.getState().cellPlugins[type] as
        | InferPlugin<TPlugins>
        | undefined;
      if (!destPlugin) {
        throw new Error(`[TableView] Plugin not found: ${type}`);
      }
      const data = table.getCellValues();
      const config =
        destPlugin.transferConfig?.(table.getColumnInfo(colId), data) ??
        destPlugin.default.config;
      table.setColumnInfo(colId, { type, config });
      // Update all cells
      const newData = { ...data };
      const srcPlugin = table.getColumnPlugin(colId);
      Object.keys(newData).forEach((rowId) => {
        if (!newData[rowId]) return;
        const cell = newData[rowId].properties[colId]!;
        newData[rowId] = {
          ...newData[rowId],
          properties: {
            ...newData[rowId].properties,
            [colId]: {
              ...cell,
              value: destPlugin.fromReadableValue(
                srcPlugin.toReadableValue(cell.value),
                config,
              ),
            },
          },
        };
      });
      table.setTableData(newData);
    };
    table.setColumnTypeConfig = (colId, action) => {
      const plugin = table.getColumnPlugin(colId);
      const { properties, data } = plugin.reducer(
        {
          properties: table.getState().columnsInfo,
          data: table.getCellValues(),
        },
        action,
      );
      table._setColumnInfo(colId, properties[colId]!);
      // Update all cells
      table.setTableData(data);
    };
    /** Column name */
    table.checkIsUniqueColumnName = (name) => {
      return Object.values(table.getState().columnsInfo).every(
        (info) => info.name !== name,
      );
    };
    table.generateUniqueColumnName = (initial = "") => {
      return getUniqueName(
        initial,
        Object.values(table.getState().columnsInfo).map((info) => info.name),
      );
    };
  },
  createColumn: <TPlugins extends CellPlugin[]>(
    column: Column<Row<TPlugins>>,
    table: Table<Row<TPlugins>>,
  ): void => {
    column.getInfo = () => table.getColumnInfo(column.id);
    column.getPlugin = () => table.getColumnPlugin(column.id);
    /** Column width */
    column.getWidth = () => `calc(var(--col-${column.id}-size) * 1px)`;
    column.handleResizeEnd = () =>
      table.setColumnInfo(column.id, { width: `${column.getSize()}px` });
  },
};
