import { Icon } from "@notion-kit/icons";
import type { RowInstance } from "@notion-kit/table-hook";
import { Kanban } from "@notion-kit/ui/kanban";
import { Button } from "@notion-kit/ui/primitives";

import { GroupActions } from "@/common";
import { useTableViewCtx } from "@/table-contexts";

import { BoardCard } from "./board-card";

interface BoardGroupProps {
  index: number;
  locked: boolean;
  row: RowInstance;
}

export function BoardGroup({ index, locked, row }: BoardGroupProps) {
  const { table } = useTableViewCtx();

  const addRow = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    table.addRowToGroup(row.id);
  };

  return (
    <Kanban.Column
      data-block-id={row.id}
      id={row.id}
      index={index}
      disabled={locked}
    >
      <Kanban.ColumnHeader>
        <div className="flex max-w-100 items-center overflow-hidden text-sm/6 font-medium whitespace-nowrap">
          {row.renderGroupingValue({})}
        </div>
        {row.getShouldShowGroupAggregates() && (
          <Button variant="hint" size="xs" className="text-muted">
            {row.subRows.length}
          </Button>
        )}
        <GroupActions
          className="ml-auto opacity-0 group-hover/kanban-column:opacity-100"
          row={row}
        />
      </Kanban.ColumnHeader>
      <Kanban.ColumnContent>
        {row.subRows.map((subRow) => (
          <BoardCard key={subRow.id} row={subRow} groupId={row.id} />
        ))}
      </Kanban.ColumnContent>
      {!locked && (
        <Button
          size="sm"
          className="w-full rounded-lg leading-tight text-secondary"
          onClick={addRow}
        >
          <Icon.Plus className="fill-current" />
          New page
        </Button>
      )}
    </Kanban.Column>
  );
}
