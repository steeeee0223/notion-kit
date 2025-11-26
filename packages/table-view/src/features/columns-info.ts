import type { DragEndEvent } from "@dnd-kit/core";
import type {
  Column,
  OnChangeFn,
  Table,
  TableFeature,
  Updater,
} from "@tanstack/react-table";
import { functionalUpdate } from "@tanstack/react-table";
import { v4 } from "uuid";

import type { ColumnInfo, PluginType, Row } from "../lib/types";
import {
  arrayToEntity,
  getDefaultCell,
  getUniqueName,
  type Entity,
} from "../lib/utils";
import type {
  CellPlugin,
  InferActions,
  InferConfig,
  InferPlugin,
} from "../plugins";
import { DEFAULT_PLUGINS } from "../plugins";
import { createDragEndUpdater, createIdsUpdater } from "./utils";

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
  onColumnInfoChange?: OnChangeFn<Entity<ColumnInfo>>;
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
  handleColumnDragEnd: (e: DragEndEvent) => void;
  _addColumnInfo: (info: ColumnInfo, idsUpdater: Updater<string[]>) => void;
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
  /**
   * @deprecated
   */
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
  updateConfig: <TPlugin extends CellPlugin>(
    updater: Updater<InferConfig<TPlugin>>,
  ) => void;
}

export const ColumnsInfoFeature: TableFeature<Row> = {
  getInitialState: (state): ColumnsInfoTableState => {
    return {
      cellPlugins: arrayToEntity(DEFAULT_PLUGINS).items,
      columnsInfo: {},
      ...state,
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
        items: {
          ...prev.items,
          [colId]: functionalUpdate(updater, prev.items[colId]!),
        },
      }));
      table.options.sync?.("table._setColumnInfo");
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
    table.handleColumnDragEnd = (e) => {
      table.options.onColumnInfoChange?.((prev) => {
        const updater = createDragEndUpdater<string>(e, (v) => v);
        return {
          ...prev,
          ids: functionalUpdate(updater, prev.ids),
        };
      });
      table.options.sync?.("table.handleColumnDragEnd");
    };
    table._addColumnInfo = (info, idsUpdater) => {
      table.options.onColumnInfoChange?.((prev) => {
        return {
          ids: functionalUpdate(idsUpdater, prev.ids),
          items: { ...prev.items, [info.id]: info },
        };
      });
      table.options.sync?.("table._addColumnInfo");
    };
    table.addColumnInfo = (payload) => {
      const { cellPlugins } = table.getState();
      const { id, name, type, at } = payload;
      const plugin = cellPlugins[type];
      if (!plugin) {
        throw new Error(`[TableView] Plugin not found: ${type}`);
      }
      const idsUpdater = createIdsUpdater(id, at);
      table._addColumnInfo(
        { id, name, type, config: plugin.default.config },
        idsUpdater,
      );
      // Update all rows
      table.setTableData((prev) =>
        prev.map((row) => {
          return {
            ...row,
            properties: {
              ...row.properties,
              [id]: getDefaultCell(plugin),
            },
          };
        }),
      );
    };
    table.duplicateColumnInfo = (colId) => {
      const { cellPlugins } = table.getState();
      const src = table.getColumnInfo(colId);
      const newColId = v4();
      const idsUpdater = createIdsUpdater(newColId, {
        id: colId,
        side: "right",
      });
      table._addColumnInfo(
        {
          ...src,
          id: newColId,
          name: table.generateUniqueColumnName(src.name),
        },
        idsUpdater,
      );
      // Update all rows
      table.setTableData((prev) =>
        prev.map((row) => {
          return {
            ...row,
            properties: {
              ...row.properties,
              [newColId]: getDefaultCell(cellPlugins[src.type]!),
            },
          };
        }),
      );
    };
    table.removeColumnInfo = (colId) => {
      table.options.onColumnInfoChange?.((prev) => {
        const { [colId]: _, ...items } = prev.items;
        return { ids: prev.ids.filter((id) => id !== colId), items };
      });
      // Update all rows
      table.setTableData((prev) =>
        prev.map((row) => {
          const { [colId]: _, ...properties } = row.properties;
          return { ...row, properties };
        }),
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
      const srcPlugin = table.getColumnPlugin(colId);
      table.setTableData((prev) =>
        prev.map((row) => {
          const cell = row.properties[colId];
          if (!cell) return row;
          return {
            ...row,
            properties: {
              ...row.properties,
              [colId]: {
                ...cell,
                value: destPlugin.fromReadableValue(
                  srcPlugin.toReadableValue(cell.value, row),
                  config,
                ),
              },
            },
          };
        }),
      );
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
    /** Setter */
    column.updateConfig = (updater) =>
      table._setColumnInfo(column.id, (v) => ({
        ...v,
        config: functionalUpdate(updater, v.config),
      }));
  },
};
