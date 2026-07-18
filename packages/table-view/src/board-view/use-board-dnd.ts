import React, { useMemo, useRef } from "react";
import { v4 } from "uuid";

import type { Row as RowModel } from "@notion-kit/table-hook";
import { Kanban, KanbanDnd } from "@notion-kit/ui/kanban";

import { useTableViewCtx } from "@/table-contexts";

export function useBoardDnd() {
  const { table } = useTableViewCtx();
  const snapshotRef = useRef<RowModel[] | null>(null);

  const handlers = useMemo<React.ComponentProps<typeof Kanban.Root>>(() => {
    return {
      onDragStart: (e) => {
        const { source } = e.operation;
        if (source?.type !== KanbanDnd.Item) return;

        snapshotRef.current = structuredClone(table.getCellValues());
      },
      onDragOver: (e) => {
        if (e.operation.source?.type !== KanbanDnd.Item) return;
        table.handleKanbanRowDragOver(e);
      },
      onDragEnd: (e) => {
        const { source } = e.operation;
        if (source?.type === KanbanDnd.Item) {
          if (e.canceled && snapshotRef.current) {
            const actionId = v4();
            const snapshot = snapshotRef.current;
            table.setTableData(snapshot, (_previous, next) => ({
              id: actionId,
              type: "data.row.move",
              payload: {
                rowId: String(source.id),
                previousPosition: -1,
                nextPosition: next.findIndex(
                  (row) => row.id === String(source.id),
                ),
              },
            }));
          } else {
            table.handleRowDragEnd(e, { reorder: false });
          }
        } else if (source?.type === KanbanDnd.Column) {
          table.handleGroupedRowDragEnd(e);
        }

        snapshotRef.current = null;
      },
    };
  }, [table]);

  return handlers;
}
