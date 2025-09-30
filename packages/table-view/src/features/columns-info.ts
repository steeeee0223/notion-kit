import type {
  Column,
  OnChangeFn,
  RowData,
  Table,
  TableFeature,
  Updater,
} from "@tanstack/react-table";
import { functionalUpdate, makeStateUpdater } from "@tanstack/react-table";

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
  onColumnsInfoChange?: OnChangeFn<ColumnsInfoState>;
}

// Define types for our new feature's table APIs
export interface ColumnsInfoTableApi {
  getColumnInfo: (colId: string) => ColumnInfo;
  getDeletedColumns: () => ColumnInfoWithId[];
  _setColumnsInfo: (updater: Updater<ColumnsInfoState>) => void;
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
      onColumnsInfoChange: makeStateUpdater("columnsInfo", table),
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
    table._setColumnsInfo = (updater) =>
      table.options.onColumnsInfoChange?.((prev) =>
        functionalUpdate(updater, prev),
      );
    table.setColumnInfo = (colId, info) => {
      table._setColumnsInfo((prev) => ({
        ...prev,
        [colId]: { ...prev[colId]!, ...info },
      }));
    };
    table.toggleColumnWrapped = (colId, updater) => {
      table._setColumnsInfo((prev) => ({
        ...prev,
        [colId]: {
          ...prev[colId]!,
          wrapped: functionalUpdate(updater, prev[colId]?.wrapped ?? false),
        },
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
