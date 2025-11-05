import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type {
  OnChangeFn,
  RowData,
  Table,
  TableFeature,
  Updater,
} from "@tanstack/react-table";
import { makeStateUpdater } from "@tanstack/react-table";

export type OrderingState = string[];

export interface OrderingTableState {
  rowOrder: OrderingState;
}

export interface OrderingOptions {
  onRowOrderChange?: OnChangeFn<OrderingState>;
  onColumnOrderChange?: OnChangeFn<OrderingState>;
}

export interface OrderingTableApi {
  setRowOrder: (updater: Updater<OrderingState>) => void;
  handleRowDragEnd: (e: DragEndEvent) => void;
  handleColumnDragEnd: (e: DragEndEvent) => void;
}

export const OrderingFeature: TableFeature = {
  getInitialState: (state): OrderingTableState => {
    return {
      rowOrder: [],
      ...state,
    };
  },

  getDefaultOptions: <TData extends RowData>(
    table: Table<TData>,
  ): OrderingOptions => {
    return {
      onRowOrderChange: makeStateUpdater("rowOrder", table),
      onColumnOrderChange: makeStateUpdater("columnOrder", table),
    };
  },

  createTable: <TData extends RowData>(table: Table<TData>): void => {
    table.setRowOrder = (updater) => table.options.onRowOrderChange?.(updater);
    table.handleRowDragEnd = (e) => {
      table.setRowOrder(createRowDragEndUpdater(e, (v) => v));
      table.setTableData(createRowDragEndUpdater(e, (v) => v.id));
    };
    table.handleColumnDragEnd = (e) => {
      table.setColumnOrder(createRowDragEndUpdater(e, (v) => v));
    };
  },
};

function createRowDragEndUpdater<T>(
  e: DragEndEvent,
  selector: (item: T) => string,
): Updater<T[]> {
  return (prev) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return prev;
    const indexes = prev.reduce(
      (acc, item, idx) => {
        if (selector(item) === active.id) acc.old = idx;
        if (selector(item) === over.id) acc.new = idx;
        return acc;
      },
      { old: -1, new: -1 },
    );
    return arrayMove(prev, indexes.old, indexes.new);
  };
}
