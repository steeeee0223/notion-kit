import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type {
  RowData,
  Table,
  TableFeature,
  Updater,
} from "@tanstack/react-table";
import { functionalUpdate } from "@tanstack/react-table";

export interface OrderingTableApi {
  handleRowDragEnd: (e: DragEndEvent) => void;
  handleColumnDragEnd: (e: DragEndEvent) => void;
}

export const OrderingFeature: TableFeature = {
  createTable: <TData extends RowData>(table: Table<TData>): void => {
    table.handleRowDragEnd = (e) => {
      table.setTableData(createDragEndUpdater(e, (v) => v.id));
    };
    table.handleColumnDragEnd = (e) => {
      table.setColumnOrder(createDragEndUpdater(e, (v) => v));
      table.options.onColumnInfoChange?.((prev) => {
        const updater = createDragEndUpdater<string>(e, (v) => v);
        return {
          ...prev,
          ids: functionalUpdate(updater, prev.ids),
        };
      });
    };
  },
};

function createDragEndUpdater<T>(
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
