import React, { useMemo, useRef } from "react";

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
            table.setTableData(snapshotRef.current);
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
