import React, { useMemo } from "react";

import { Kanban, KanbanDnd } from "@notion-kit/ui/kanban";

import { useTableViewCtx } from "@/table-contexts";

export function useBoardDnd() {
  const { table } = useTableViewCtx();

  const handlers = useMemo<React.ComponentProps<typeof Kanban.Root>>(() => {
    return {
      onDragOver: (e) => {
        if (e.operation.source?.type !== KanbanDnd.Item) return;
        table.handleKanbanRowDragOver(e);
      },
      onDragEnd: (e) => {
        const { source } = e.operation;
        if (source?.type === KanbanDnd.Item) {
          table.handleRowDragEnd(e, { reorder: false });
        } else if (source?.type === KanbanDnd.Column) {
          table.handleGroupedRowDragEnd(e);
        }
      },
    };
  }, [table]);

  return handlers;
}
