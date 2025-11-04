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
      // if we don't have a rowOrder yet, initialize it to the current order
      const rowCount = table.getRowCount();
      if (rowCount !== table.getState().rowOrder.length) {
        table.setRowOrder(table.getRowModel().rows.map((row) => row.id));
      }
      table.setRowOrder(createRowDragEndUpdater(e));
    };
    table.handleColumnDragEnd = (e) => {
      table.setColumnOrder(createRowDragEndUpdater(e));
    };
  },
};

function createRowDragEndUpdater(e: DragEndEvent): Updater<OrderingState> {
  return (prev) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return prev;
    const oldIndex = prev.indexOf(active.id as string);
    const newIndex = prev.indexOf(over.id as string);
    return arrayMove(prev, oldIndex, newIndex);
  };
}
