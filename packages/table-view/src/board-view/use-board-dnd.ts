import { useState } from "react";

import type { MoveRowOptions } from "@notion-kit/table-hook";
import { KanbanDnd, type KanbanMove } from "@notion-kit/ui/kanban";

import { useTableViewCtx } from "@/table-contexts";

export function useBoardDnd() {
  const { table } = useTableViewCtx();
  const [pendingMove, setPendingMove] = useState<{
    intent: MoveRowOptions;
    propertyId: string | undefined;
    methodId: string | undefined;
  } | null>(null);

  const canMove = (move: KanbanMove) =>
    !table.getTableGlobalState().locked &&
    (move.type === KanbanDnd.Column ||
      table.getCanMoveRowToGroup(move.id, move.columnId));

  const onMove = (move: KanbanMove) => {
    if (!canMove(move)) return;
    if (move.type === KanbanDnd.Column) {
      table.moveGroup({ groupId: move.id, beforeGroupId: move.beforeId });
      return;
    }
    const intent = {
      rowId: move.id,
      groupId: move.columnId,
      beforeRowId: move.beforeId,
    };
    if (table.atoms.sorting.get().length === 0) {
      table.moveRow(intent);
      return;
    }
    const propertyId = table.atoms.grouping.get()[0];
    setPendingMove({
      intent,
      propertyId,
      methodId: propertyId
        ? table.getSelectedGroupingMethod(propertyId).id
        : undefined,
    });
  };

  const isPendingValid = () => {
    if (!pendingMove || table.getTableGlobalState().locked) return false;
    const { intent, propertyId, methodId } = pendingMove;
    const currentProperty = table.atoms.grouping.get()[0];
    return (
      propertyId === currentProperty &&
      (currentProperty
        ? table.getSelectedGroupingMethod(currentProperty).id
        : undefined) === methodId &&
      intent.groupId &&
      table.getCanMoveRowToGroup(intent.rowId, intent.groupId) &&
      table.getRowModel().rowsById[intent.rowId] &&
      (intent.beforeRowId === null ||
        table.getRowModel().rowsById[intent.beforeRowId]?.parentId ===
          intent.groupId)
    );
  };

  if (pendingMove && !isPendingValid()) setPendingMove(null);

  const confirmMove = () => {
    if (pendingMove && isPendingValid()) {
      table.resetSorting();
      table.moveRow(pendingMove.intent);
    }
    setPendingMove(null);
  };

  return {
    onMove,
    canMove,
    pendingMove,
    confirmMove,
    cancelMove: () => setPendingMove(null),
  };
}
