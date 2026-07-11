import type { DragEndEvent } from "@dnd-kit/react";
import type { OnChangeFn, TableFeature, Updater } from "@tanstack/react-table";
import { functionalUpdate } from "@tanstack/react-table";
import { v4 } from "uuid";

import { getSortableItemsAfterDrag } from "@notion-kit/ui/primitives";

import type { TableInstance } from "@/features/types";
import { createIdsUpdater } from "@/features/utils";
import type { ColumnInfo, PluginType } from "@/lib/types";
import {
  arrayToEntity,
  getDefaultCell,
  getUniqueName,
  type Entity,
} from "@/lib/utils";
import type { CellPlugin, InferConfig, InferPlugin } from "@/plugins";
import { DEFAULT_PLUGINS } from "@/plugins";

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

export const ColumnsInfoFeature: TableFeature = {
  getInitialState: (state): ColumnsInfoTableState => {
    return {
      cellPlugins: arrayToEntity(DEFAULT_PLUGINS).items,
      columnsInfo: {},
      ...state,
    };
  },

  constructTableAPIs: (table) => {
    const instance = table as unknown as TableInstance;

    const getColumnVisibilityFromInfo = () => {
      const { columnOrder, columnsInfo } = instance.store.state;
      return columnOrder.reduce<Record<string, boolean>>((acc, colId) => {
        const info = columnsInfo[colId];
        acc[colId] = !info?.hidden && !info?.isDeleted;
        return acc;
      }, {});
    };

    instance.setColumnVisibility = (updater) => {
      const nextVisibility = functionalUpdate(
        updater,
        getColumnVisibilityFromInfo(),
      );

      queueMicrotask(() => {
        instance.options.onColumnInfoChange?.((prev) => ({
          ...prev,
          items: Object.fromEntries(
            Object.entries(prev.items).map(([colId, info]) => [
              colId,
              {
                ...info,
                hidden: !(nextVisibility[colId] ?? true),
              },
            ]),
          ),
        }));
      });
    };

    /** Column Getters */
    instance.getColumnInfo = (colId) => {
      const info = instance.store.state.columnsInfo[colId];
      if (!info) {
        throw new Error(`[TableView] Column info not found: "${colId}"`);
      }
      return info;
    };
    instance.getColumnPlugin = (colId) => {
      const type = instance.getColumnInfo(colId).type;
      const plugin = instance.store.state.cellPlugins[type];
      if (!plugin) {
        throw new Error(`[TableView] Plugin not found: ${type}`);
      }
      return plugin;
    };
    instance.getDeletedColumns = () => {
      const { columnOrder, columnsInfo } = instance.store.state;
      return columnOrder.reduce<ColumnInfo[]>((acc, colId) => {
        const info = columnsInfo[colId];
        if (!info?.isDeleted) return acc;
        acc.push({ ...info, id: colId });
        return acc;
      }, []);
    };
    instance.countVisibleColumns = () => {
      const { columnsInfo } = instance.store.state;
      return Object.values(columnsInfo).reduce((acc, info) => {
        if (!info.hidden && !info.isDeleted) acc++;
        return acc;
      }, 0);
    };
    /** Overrides */
    instance.toggleAllColumnsVisible = () => {
      const canHide = instance.countVisibleColumns() > 1;
      instance.store.state.columnOrder.forEach((colId) => {
        instance._setColumnInfo(colId, (prev) => {
          if (prev.isDeleted) return prev;
          return { ...prev, hidden: prev.type === "title" ? false : canHide };
        });
      });
    };
    /** Column Setters */
    instance._setColumnInfo = (colId, updater) => {
      instance.options.onColumnInfoChange?.((prev) => ({
        ...prev,
        items: {
          ...prev.items,
          [colId]: functionalUpdate(updater, prev.items[colId]!),
        },
      }));
    };
    instance.setColumnInfo = (colId, info) => {
      instance._setColumnInfo(colId, (prev) => ({ ...prev, ...info }));
    };
    instance.handleColumnDragEnd = (e) => {
      instance.options.onColumnInfoChange?.((prev) => {
        return {
          ...prev,
          ids: getSortableItemsAfterDrag(prev.ids, e),
        };
      });
    };
    instance._addColumnInfo = (info, idsUpdater) => {
      instance.options.onColumnInfoChange?.((prev) => {
        return {
          ids: functionalUpdate(idsUpdater, prev.ids),
          items: { ...prev.items, [info.id]: info },
        };
      });
    };
    instance.addColumnInfo = (payload) => {
      const { cellPlugins, columnsInfo } = instance.store.state;
      const { id, name, type, at } = payload;
      if (columnsInfo[id]) {
        throw new Error(`[TableView] Column already exists: "${id}"`);
      }
      const plugin = cellPlugins[type];
      if (!plugin) {
        throw new Error(`[TableView] Plugin not found: ${type}`);
      }
      const idsUpdater = createIdsUpdater(id, at);
      instance._addColumnInfo(
        { id, name, type, config: plugin.default.config },
        idsUpdater,
      );
      // Update all rows
      instance.setTableData((prev) =>
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
    instance.duplicateColumnInfo = (colId) => {
      const { cellPlugins } = instance.store.state;
      const src = instance.getColumnInfo(colId);
      const newColId = v4();
      const idsUpdater = createIdsUpdater(newColId, {
        id: colId,
        side: "right",
      });
      instance._addColumnInfo(
        {
          ...src,
          id: newColId,
          name: instance.generateUniqueColumnName(src.name),
        },
        idsUpdater,
      );
      // Update all rows
      instance.setTableData((prev) =>
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
    instance.removeColumnInfo = (colId) => {
      instance.options.onColumnInfoChange?.((prev) => {
        const { [colId]: _, ...items } = prev.items;
        return { ids: prev.ids.filter((id) => id !== colId), items };
      });
      // Update all rows
      instance.setTableData((prev) =>
        prev.map((row) => {
          const { [colId]: _, ...properties } = row.properties;
          return { ...row, properties };
        }),
      );
    };
    instance.toggleColumnWrapped = (colId, updater) => {
      instance._setColumnInfo(colId, (prev) => ({
        ...prev,
        wrapped: functionalUpdate(updater, prev.wrapped ?? false),
      }));
    };
    instance.setColumnType = <TPlugins extends CellPlugin[]>(
      colId: string,
      type: PluginType<TPlugins>,
    ) => {
      const destPlugin = instance.store.state.cellPlugins[type] as
        | InferPlugin<TPlugins>
        | undefined;
      if (!destPlugin) {
        throw new Error(`[TableView] Plugin not found: ${type}`);
      }
      const data = instance.getCellValues();
      const config =
        destPlugin.transferConfig?.(instance.getColumnInfo(colId), data) ??
        destPlugin.default.config;
      instance.setColumnInfo(colId, { type, config });
      // Update all cells
      const srcPlugin = instance.getColumnPlugin(colId);
      instance.setTableData((prev) =>
        prev.map((row) => {
          const cell = row.properties[colId];
          if (!cell) return row;
          return {
            ...row,
            properties: {
              ...row.properties,
              [colId]: {
                ...cell,
                value: destPlugin.fromValue(
                  srcPlugin.toValue(cell.value, row),
                  config,
                ),
              },
            },
          };
        }),
      );
    };
    /** Column name */
    instance.checkIsUniqueColumnName = (name) => {
      return Object.values(instance.store.state.columnsInfo).every(
        (info) => info.name !== name,
      );
    };
    instance.generateUniqueColumnName = (initial = "") => {
      return getUniqueName(
        initial,
        Object.values(instance.store.state.columnsInfo).map(
          (info) => info.name,
        ),
      );
    };
  },
  assignColumnPrototype: (prototype, table) => {
    const instance = table as unknown as TableInstance;

    prototype.getInfo = function (this: { id: string }) {
      return instance.getColumnInfo(this.id);
    };
    prototype.getPlugin = function (this: { id: string }) {
      return instance.getColumnPlugin(this.id);
    };
    /** Column width */
    prototype.getWidth = function (this: { id: string }) {
      return `calc(var(--col-${this.id}-size) * 1px)`;
    };
    prototype.handleResizeEnd = function (this: {
      id: string;
      getSize: () => number;
    }) {
      instance.setColumnInfo(this.id, { width: `${this.getSize()}px` });
    };
    /** Setter */
    prototype.updateConfig = function (
      this: { id: string },
      updater: Updater<unknown>,
    ) {
      instance._setColumnInfo(this.id, (v) => ({
        ...v,
        config: functionalUpdate(updater, v.config),
      }));
    };
  },
};
