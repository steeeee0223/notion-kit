import type {
  Column,
  Table,
  TableFeature,
  Updater,
} from "@tanstack/react-table";
import { functionalUpdate } from "@tanstack/react-table";

import type {
  ColumnInfo,
  PluginType,
  PropertyBase,
  Row,
  Rows,
} from "../lib/types";
import { arrayToEntity } from "../lib/utils";
import type { CellPlugin, InferActions, InferPlugin } from "../plugins";
import { DEFAULT_PLUGINS } from "../plugins";
import { TableViewAtom } from "../table-contexts";

// define types for our new feature's custom state
export type ColumnsInfoState = Record<string, ColumnInfo<CellPlugin>>;

export interface ColumnsInfoTableState {
  cellPlugins: Record<string, CellPlugin>;
  columnsInfo: ColumnsInfoState;
}

// define types for our new feature's table options
export interface ColumnsInfoOptions {
  onColumnInfoChange?: <TPlugin extends CellPlugin>(
    id: string,
    updater: Updater<ColumnInfo<TPlugin>>,
  ) => void;
}

// Define types for our new feature's table APIs
export interface ColumnsInfoTableApi {
  getColumnInfo: (colId: string) => ColumnInfo;
  getColumnPlugin: (colId: string) => CellPlugin;
  getDeletedColumns: () => ColumnInfo[];
  setColumnInfo: (
    colId: string,
    info: Partial<Omit<PropertyBase, "id">>,
  ) => void;
  toggleColumnWrapped: (colId: string, updater: Updater<boolean>) => void;
  setColumnType: <TPlugins extends CellPlugin[]>(
    colId: string,
    type: PluginType<TPlugins>,
  ) => void;
  setColumnTypeConfig: <TPlugins extends CellPlugin[]>(
    colId: string,
    actions: InferActions<InferPlugin<TPlugins>>,
  ) => void;
  checkIsUniqueColumnName: (name: string) => boolean;
}

export interface ColumnInfoColumnApi {
  getInfo: () => ColumnInfo;
  getWidth: () => string;
  handleResizeEnd: () => void;
}

export const ColumnsInfoFeature: TableFeature<Row> = {
  // define the new feature's initial state
  getInitialState: (state): ColumnsInfoTableState => {
    return {
      cellPlugins: arrayToEntity(DEFAULT_PLUGINS).items,
      columnsInfo: {},
      ...state,
    };
  },

  // define the new feature's default options
  getDefaultOptions: (table: Table<Row>): ColumnsInfoOptions => {
    return {
      onColumnInfoChange: (id, updater) => {
        table.setState((prev) => ({
          ...prev,
          columnsInfo: {
            ...prev.columnsInfo,
            [id]: functionalUpdate(
              updater as Updater<ColumnInfo>,
              prev.columnsInfo[id]!,
            ),
          },
        }));
      },
    };
  },

  // define the new feature's table instance methods
  createTable: (table: Table<Row>): void => {
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
    table.setColumnInfo = (colId, info) => {
      table.options.onColumnInfoChange?.(colId, (prev) => ({
        ...prev,
        ...info,
      }));
      if (info.hidden !== undefined || info.isDeleted !== undefined)
        table.setColumnVisibility((prev) => ({
          ...prev,
          [colId]: !info.hidden && !info.isDeleted,
        }));
    };
    table.toggleColumnWrapped = (colId, updater) => {
      table.options.onColumnInfoChange?.(colId, (prev) => ({
        ...prev,
        wrapped: functionalUpdate(updater, prev.wrapped ?? false),
      }));
    };
    table.setColumnType = (colId, type) => {
      const plugin = table.getColumnPlugin(colId);
      const data = table.getRowModel().rows.reduce<Rows>((acc, row) => {
        acc[row.id] = row.original;
        return acc;
      }, {});
      table.options.onColumnInfoChange?.(colId, (prev) => ({
        ...prev,
        type,
        config: plugin.transferConfig?.(prev, data) ?? plugin.default.config,
      }));
      table.setColumnTypeConfig = (colId, actions) => {
        const plugin = table.getColumnPlugin(colId);
        // TODO update this
        const newState = plugin.reducer({} as TableViewAtom, actions);
        table.options.onColumnInfoChange?.(colId, newState.properties[colId]!);
      };
    };
    table.checkIsUniqueColumnName = (name) => {
      return Object.values(table.getState().columnsInfo).every(
        (info) => info.name !== name,
      );
    };
  },
  createColumn: <TPlugins extends CellPlugin[]>(
    column: Column<Row<TPlugins>>,
    table: Table<Row<TPlugins>>,
  ): void => {
    column.getInfo = () => table.getColumnInfo(column.id);
    column.getWidth = () => `calc(var(--col-${column.id}-size) * 1px)`;
    column.handleResizeEnd = () =>
      table.setColumnInfo(column.id, {
        width: `${column.getSize()}px`,
      });
  },
};
