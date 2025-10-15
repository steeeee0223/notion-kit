import type {
  Column,
  Table,
  TableFeature,
  Updater,
} from "@tanstack/react-table";
import { functionalUpdate } from "@tanstack/react-table";

import type { Cell, ColumnInfo, PluginType, Row, Rows } from "../lib/types";
import { arrayToEntity, getUniqueName } from "../lib/utils";
import type { CellPlugin, InferActions, InferPlugin } from "../plugins";
import { DEFAULT_PLUGINS } from "../plugins";

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
  onCellChange?: <TPlugins extends CellPlugin[]>(
    rowId: string,
    colId: string,
    data: Cell<InferPlugin<TPlugins>>,
  ) => void;
  onTableDataChange?: (data: Rows) => void;
}

// Define types for our new feature's table APIs
export interface ColumnsInfoTableApi {
  // Column Getters
  getColumnInfo: (colId: string) => ColumnInfo;
  getColumnPlugin: (colId: string) => CellPlugin;
  getDeletedColumns: () => ColumnInfo[];
  countVisibleColumns: () => number;
  // Column Setters
  _setColumnInfo: (colId: string, updater: Updater<ColumnInfo>) => void;
  setColumnInfo: (colId: string, info: Partial<Omit<ColumnInfo, "id">>) => void;
  toggleColumnWrapped: (colId: string, updater: Updater<boolean>) => void;
  setColumnType: <TPlugins extends CellPlugin[]>(
    colId: string,
    type: PluginType<TPlugins>,
  ) => void;
  setColumnTypeConfig: <TPlugins extends CellPlugin[]>(
    colId: string,
    actions: InferActions<InferPlugin<TPlugins>>,
  ) => void;
  // Column name checkers
  checkIsUniqueColumnName: (name: string) => boolean;
  generateUniqueColumnName: (initial?: string) => string;
  // Cell API
  getCellValues: <TPlugins extends CellPlugin[]>() => Rows<TPlugins>;
  getCell: <TPlugin extends CellPlugin>(
    colId: string,
    rowId: string,
  ) => Cell<TPlugin>;
  // Cell updater
  updateCell: <TPlugin extends CellPlugin>(
    rowId: string,
    colId: string,
    data: Cell<TPlugin>,
  ) => void;
}

export interface ColumnInfoColumnApi {
  getInfo: () => ColumnInfo;
  getWidth: () => string;
  getPlugin: () => CellPlugin;
  handleResizeEnd: () => void;
  // Cell updater
  getCell: <TPlugin extends CellPlugin>(rowId: string) => Cell<TPlugin>;
  updateCell: <TPlugin extends CellPlugin>(
    rowId: string,
    data: Cell<TPlugin>,
  ) => void;
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
    /** Cell API */
    table.getCellValues = () =>
      table.getCoreRowModel().rows.reduce<Rows>((acc, row) => {
        acc[row.id] = row.original;
        return acc;
      }, {});
    table.getCell = (colId, rowId) => {
      const cell = table.getRow(rowId).original.properties[colId];
      if (!cell) {
        throw new Error(`[TableView] Cell not found: ${rowId}, ${colId}`);
      }
      return cell;
    };
    table.updateCell = (rowId, colId, data) =>
      table.options.onCellChange?.(rowId, colId, data);
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
    /** Column Setters */
    table._setColumnInfo = (colId, updater) => {
      table.options.onColumnInfoChange?.(colId, updater);
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
    table.toggleColumnWrapped = (colId, updater) => {
      table._setColumnInfo(colId, (prev) => ({
        ...prev,
        wrapped: functionalUpdate(updater, prev.wrapped ?? false),
      }));
    };
    table.toggleAllColumnsVisible = () => {
      const canHide = table.countVisibleColumns() > 1;
      table.getState().columnOrder.forEach((colId) => {
        table._setColumnInfo(colId, (prev) => {
          if (prev.isDeleted) return prev;
          return { ...prev, hidden: prev.type === "title" ? false : canHide };
        });
      });
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
      table.options.onTableDataChange?.(newData);
    };
    table.setColumnTypeConfig = (colId, actions) => {
      const plugin = table.getColumnPlugin(colId);
      const { properties, data } = plugin.reducer(
        {
          properties: table.getState().columnsInfo,
          data: table.getCellValues(),
        },
        actions,
      );
      table._setColumnInfo(colId, properties[colId]!);
      // Update all cells
      table.options.onTableDataChange?.(data);
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
    /** Cell */
    column.getCell = (rowId) => table.getCell(column.id, rowId);
    column.updateCell = (rowId, data) => {
      table.updateCell(rowId, column.id, data);
    };
  },
};
