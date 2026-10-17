import type { DragEndEvent } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";

import type { TableInstance } from "@notion-kit/table-hook";
import { getSortableItemsAfterDrag } from "@notion-kit/ui/primitives";

export type RowMoveIntent = Parameters<TableInstance["moveRow"]>[0];

/** Normalize library state while the drag operation still exists. */
export function getRowMoveIntent(
  table: TableInstance,
  event: DragEndEvent,
): RowMoveIntent | null {
  const { source, target } = event.operation;
  if (event.canceled || !source || !target) return null;
  const rowId = String(source.id);
  const rowsById = table.getRowModel().rowsById;
  const sourceRow = rowsById[rowId];
  if (!sourceRow || table.atoms.tableGlobal.get().locked) return null;

  const groupId = isSortable(source) ? source.group : undefined;
  const group = typeof groupId === "string" ? rowsById[groupId] : undefined;
  let ids = table.options.data.map((row) => row.id);
  let destinationGroupId: string | undefined;
  if (group?.getIsGrouped() && isSortable(source)) {
    if (
      source.index !== source.initialIndex ||
      source.group !== source.initialGroup
    ) {
      const siblings = group.subRows.filter((row) => row.id !== rowId);
      return {
        rowId,
        groupId: group.id,
        beforeRowId: siblings[source.index]?.id ?? null,
      };
    }

    ids = group.subRows.map((row) => row.id);
    destinationGroupId = group.id;
  }

  const next = getSortableItemsAfterDrag(ids, event);
  const index = next.indexOf(rowId);
  if (index < 0 || next === ids) return null;
  return {
    rowId,
    ...(destinationGroupId && { groupId: destinationGroupId }),
    beforeRowId: next[index + 1] ?? null,
  };
}

export function getGroupMoveIntent(
  table: TableInstance,
  event: DragEndEvent,
): Parameters<TableInstance["moveGroup"]>[0] | null {
  if (event.canceled || !event.operation.source || !event.operation.target) {
    return null;
  }
  const groupId = String(event.operation.source.id);
  const order = table.atoms.groupingState.get().groupOrder;
  const next = getSortableItemsAfterDrag(order, event);
  const index = next.indexOf(groupId);
  if (index < 0 || next === order) return null;
  return { groupId, beforeGroupId: next[index + 1] ?? null };
}
