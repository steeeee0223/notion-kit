import type {
  Column,
  RowData,
  Table,
  TableFeature,
  Updater,
} from "@tanstack/react-table";
import { functionalUpdate } from "@tanstack/react-table";

import type { IconData } from "@notion-kit/icon-block";

// define types for our new feature's custom state
export interface ColumnInfo {
  name: string;
  icon?: IconData | null;
  width?: string;
  description?: string;
  wrapped?: boolean;
  hidden?: boolean;
  isDeleted?: boolean;
}
export interface ColumnInfoWithId extends ColumnInfo {
  id: string;
}

export type ColumnsInfoState = Record<string, ColumnInfo>;

export interface ColumnsInfoTableState {
  columnsInfo: ColumnsInfoState;
}

// define types for our new feature's table options
export interface ColumnsInfoOptions {
  onColumnInfoChange?: (id: string, updater: Updater<ColumnInfo>) => void;
}

// Define types for our new feature's table APIs
export interface ColumnsInfoTableApi {
  getColumnInfo: (colId: string) => ColumnInfo;
  getDeletedColumns: () => ColumnInfoWithId[];
  setColumnInfo: (colId: string, info: Partial<ColumnInfo>) => void;
  toggleColumnWrapped: (colId: string, updater: Updater<boolean>) => void;
}

export interface ColumnInfoColumnApi {
  getInfo: () => ColumnInfo;
  getWidth: () => string;
  handleResizeEnd: () => void;
}

export const ColumnsInfoFeature: TableFeature = {
  // define the new feature's initial state
  getInitialState: (state): ColumnsInfoTableState => {
    return { columnsInfo: {}, ...state };
  },

  // define the new feature's default options
  getDefaultOptions: <TData extends RowData>(
    table: Table<TData>,
  ): ColumnsInfoOptions => {
    return {
      onColumnInfoChange: (id, updater) => {
        table.setState((prev) => ({
          ...prev,
          columnsInfo: {
            ...prev.columnsInfo,
            [id]: functionalUpdate(updater, prev.columnsInfo[id]!),
          },
        }));
      },
    };
  },

  // define the new feature's table instance methods
  createTable: <TData extends RowData>(table: Table<TData>): void => {
    table.getColumnInfo = (colId) => {
      const info = table.getState().columnsInfo[colId];
      if (!info) {
        throw new Error(`[TableView] Column info not found: "${colId}"`);
      }
      return info;
    };
    table.getDeletedColumns = () => {
      const { columnOrder, columnsInfo } = table.getState();
      return columnOrder.reduce<ColumnInfoWithId[]>((acc, colId) => {
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
  },
  createColumn: <TData extends RowData>(
    column: Column<TData>,
    table: Table<TData>,
  ): void => {
    column.getInfo = () => table.getColumnInfo(column.id);
    column.getWidth = () => `calc(var(--col-${column.id}-size) * 1px)`;
    column.handleResizeEnd = () =>
      table.setColumnInfo(column.id, {
        width: `${column.getSize()}px`,
      });
  },
};
