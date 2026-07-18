import type { DragEndEvent } from "@dnd-kit/react";
import type { TableFeature, Updater } from "@tanstack/react-table";
import { functionalUpdate } from "@tanstack/react-table";
import { v4 } from "uuid";

import { getSortableItemsAfterDrag } from "@notion-kit/ui/primitives";

import type { _TableInstance } from "@/features/types";
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
import type {
  DataResourceAction,
  PropertiesResourceAction,
  ResourceChangeFn,
} from "@/table-contexts";

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
  onColumnInfoChange?: ResourceChangeFn<
    Entity<ColumnInfo>,
    PropertiesResourceAction
  >;
}

export interface ColumnsInfoTableApi {
  // Column Getters
  getColumnInfo: (colId: string) => ColumnInfo;
  getColumnPlugin: (colId: string) => CellPlugin;
  getDeletedColumns: () => ColumnInfo[];
  countVisibleColumns: () => number;
  // Column Setters
  _setColumnInfo: (
    colId: string,
    updater: Updater<ColumnInfo>,
    action?: PropertiesResourceAction,
  ) => void;
  setColumnInfo: (
    colId: string,
    info: Partial<Omit<ColumnInfo, "id">>,
    action?: PropertiesResourceAction,
  ) => void;
  handleColumnDragEnd: (e: DragEndEvent) => void;
  _addColumnInfo: (
    info: ColumnInfo,
    idsUpdater: Updater<string[]>,
    action: PropertiesResourceAction,
  ) => void;
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

function getPropertyPosition(entity: Entity<ColumnInfo>, propertyId: string) {
  return entity.ids.indexOf(propertyId);
}

function createPropertyUpdateAction(
  id: string,
  propertyId: string,
  info: Partial<Omit<ColumnInfo, "id">>,
): PropertiesResourceAction {
  if ("hidden" in info) {
    return {
      id,
      type: "properties.visibility.change",
      payload: {
        propertyIds: [propertyId],
        previousHidden: {},
        nextHidden: { [propertyId]: Boolean(info.hidden) },
      },
    };
  }
  if (info.isDeleted === true) {
    return {
      id,
      type: "properties.delete",
      payload: { propertyId, previousPosition: -1 },
    };
  }
  if (info.isDeleted === false) {
    return {
      id,
      type: "properties.restore",
      payload: { propertyId },
    };
  }
  if ("width" in info) {
    return {
      id,
      type: "properties.resize",
      payload: { propertyId, nextWidth: info.width },
    };
  }
  return {
    id,
    type: "properties.update",
    payload: { propertyId, previous: {}, next: info },
  };
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
    const instance = table as unknown as _TableInstance;

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
        const actionId = v4();
        instance.options.onColumnInfoChange?.(
          (prev) => ({
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
          }),
          (previous, next) => {
            const propertyIds = next.ids.filter(
              (colId) =>
                previous.items[colId]?.hidden !== next.items[colId]?.hidden,
            );
            return {
              id: actionId,
              type: "properties.visibility.change",
              payload: {
                propertyIds,
                previousHidden: Object.fromEntries(
                  propertyIds.map((colId) => [
                    colId,
                    Boolean(previous.items[colId]?.hidden),
                  ]),
                ),
                nextHidden: Object.fromEntries(
                  propertyIds.map((colId) => [
                    colId,
                    Boolean(next.items[colId]?.hidden),
                  ]),
                ),
              },
            };
          },
        );
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
      const actionId = v4();
      instance.options.onColumnInfoChange?.(
        (prev) => ({
          ...prev,
          items: Object.fromEntries(
            Object.entries(prev.items).map(([colId, info]) => [
              colId,
              info.isDeleted
                ? info
                : {
                    ...info,
                    hidden: info.type === "title" ? false : canHide,
                  },
            ]),
          ),
        }),
        (previous, next) => {
          const propertyIds = next.ids.filter(
            (colId) =>
              previous.items[colId]?.hidden !== next.items[colId]?.hidden,
          );
          return {
            id: actionId,
            type: "properties.visibility.change",
            payload: {
              propertyIds,
              previousHidden: Object.fromEntries(
                propertyIds.map((colId) => [
                  colId,
                  Boolean(previous.items[colId]?.hidden),
                ]),
              ),
              nextHidden: Object.fromEntries(
                propertyIds.map((colId) => [
                  colId,
                  Boolean(next.items[colId]?.hidden),
                ]),
              ),
            },
          };
        },
      );
    };
    /** Column Setters */
    instance._setColumnInfo = (colId, updater, action) => {
      const fallbackAction = action ?? {
        id: v4(),
        type: "properties.update",
        payload: { propertyId: colId, previous: {}, next: {} },
      };
      instance.options.onColumnInfoChange?.(
        (prev) => ({
          ...prev,
          items: {
            ...prev.items,
            [colId]: functionalUpdate(updater, prev.items[colId]!),
          },
        }),
        (previous, next) => {
          if (fallbackAction.type === "properties.update") {
            return {
              ...fallbackAction,
              payload: {
                propertyId: colId,
                previous: previous.items[colId] ?? {},
                next: next.items[colId] ?? {},
              },
            };
          }
          if (fallbackAction.type === "properties.resize") {
            return {
              ...fallbackAction,
              payload: {
                propertyId: colId,
                previousWidth: previous.items[colId]?.width,
                nextWidth: next.items[colId]?.width,
              },
            };
          }
          if (fallbackAction.type === "properties.visibility.change") {
            return {
              ...fallbackAction,
              payload: {
                propertyIds: [colId],
                previousHidden: {
                  [colId]: Boolean(previous.items[colId]?.hidden),
                },
                nextHidden: { [colId]: Boolean(next.items[colId]?.hidden) },
              },
            };
          }
          if (fallbackAction.type === "properties.delete") {
            return {
              ...fallbackAction,
              payload: {
                propertyId: colId,
                previousPosition: getPropertyPosition(previous, colId),
              },
            };
          }
          return fallbackAction;
        },
      );
    };
    instance.setColumnInfo = (colId, info, action) => {
      instance._setColumnInfo(
        colId,
        (prev) => ({ ...prev, ...info }),
        action ?? createPropertyUpdateAction(v4(), colId, info),
      );
    };
    instance.handleColumnDragEnd = (e) => {
      const propertyId = String(e.operation.source?.id ?? "");
      const actionId = v4();
      instance.options.onColumnInfoChange?.(
        (prev) => {
          return {
            ...prev,
            ids: getSortableItemsAfterDrag(prev.ids, e),
          };
        },
        (previous, next) => ({
          id: actionId,
          type: "properties.move",
          payload: {
            propertyId,
            previousPosition: getPropertyPosition(previous, propertyId),
            nextPosition: getPropertyPosition(next, propertyId),
          },
        }),
      );
    };
    instance._addColumnInfo = (info, idsUpdater, action) => {
      instance.options.onColumnInfoChange?.(
        (prev) => {
          return {
            ids: functionalUpdate(idsUpdater, prev.ids),
            items: { ...prev.items, [info.id]: info },
          };
        },
        (_previous, next) => {
          if (action.type === "properties.duplicate") {
            return {
              ...action,
              payload: {
                ...action.payload,
                nextPosition: getPropertyPosition(next, info.id),
              },
            };
          }
          if (action.type !== "properties.create") return action;
          return {
            ...action,
            payload: {
              ...action.payload,
              nextPosition: getPropertyPosition(next, info.id),
              property: next.items[info.id]!,
            },
          };
        },
      );
    };
    instance.addColumnInfo = (payload) => {
      const actionId = v4();
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
        {
          id: actionId,
          type: "properties.create",
          payload: {
            propertyId: id,
            nextPosition: -1,
            property: { id, name, type, config: plugin.default.config },
          },
        },
      );
      // Update all rows
      instance.setTableData(
        (prev) =>
          prev.map((row) => {
            return {
              ...row,
              properties: {
                ...row.properties,
                [id]: getDefaultCell(plugin),
              },
            };
          }),
        (_previous, next): DataResourceAction => ({
          id: actionId,
          type: "data.cell.update",
          payload: {
            rowIds: next.map((row) => row.id),
            propertyId: id,
          },
        }),
      );
    };
    instance.duplicateColumnInfo = (colId) => {
      const actionId = v4();
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
        {
          id: actionId,
          type: "properties.duplicate",
          payload: {
            sourcePropertyId: colId,
            propertyId: newColId,
            nextPosition: -1,
          },
        },
      );
      // Update all rows
      instance.setTableData(
        (prev) =>
          prev.map((row) => {
            return {
              ...row,
              properties: {
                ...row.properties,
                [newColId]: getDefaultCell(cellPlugins[src.type]!),
              },
            };
          }),
        (_previous, next): DataResourceAction => ({
          id: actionId,
          type: "data.cell.update",
          payload: {
            rowIds: next.map((row) => row.id),
            propertyId: newColId,
          },
        }),
      );
    };
    instance.removeColumnInfo = (colId) => {
      const actionId = v4();
      instance.options.onColumnInfoChange?.(
        (prev) => {
          const { [colId]: _, ...items } = prev.items;
          return { ids: prev.ids.filter((id) => id !== colId), items };
        },
        (previous) => ({
          id: actionId,
          type: "properties.delete",
          payload: {
            propertyId: colId,
            previousPosition: getPropertyPosition(previous, colId),
          },
        }),
      );
      // Update all rows
      instance.setTableData(
        (prev) =>
          prev.map((row) => {
            const { [colId]: _, ...properties } = row.properties;
            return { ...row, properties };
          }),
        (_previous, next): DataResourceAction => ({
          id: actionId,
          type: "data.cell.update",
          payload: {
            rowIds: next.map((row) => row.id),
            propertyId: colId,
          },
        }),
      );
    };
    instance.toggleColumnWrapped = (colId, updater) => {
      instance._setColumnInfo(
        colId,
        (prev) => ({
          ...prev,
          wrapped: functionalUpdate(updater, prev.wrapped ?? false),
        }),
        {
          id: v4(),
          type: "properties.update",
          payload: { propertyId: colId, previous: {}, next: {} },
        },
      );
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
      const actionId = v4();
      const previousType = instance.getColumnInfo(colId).type;
      instance.setColumnInfo(
        colId,
        { type, config },
        {
          id: actionId,
          type: "properties.type.change",
          payload: {
            propertyId: colId,
            previousType,
            nextType: type,
          },
        },
      );
      // Update all cells
      const srcPlugin = instance.getColumnPlugin(colId);
      instance.setTableData(
        (prev) =>
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
        (previous, next): DataResourceAction => ({
          id: actionId,
          type: "data.cell.update",
          payload: {
            rowIds: next.map((row) => row.id),
            propertyId: colId,
            previousValue: previous[0]?.properties[colId]?.value,
            nextValue: next[0]?.properties[colId]?.value,
          },
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
    const instance = table as unknown as _TableInstance;

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
      instance._setColumnInfo(
        this.id,
        (v) => ({
          ...v,
          config: functionalUpdate(updater, v.config),
        }),
        {
          id: v4(),
          type: "properties.update",
          payload: { propertyId: this.id, previous: {}, next: {} },
        },
      );
    };
  },
};
