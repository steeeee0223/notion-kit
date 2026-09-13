import { Icon } from "@notion-kit/icons";
import type { RowInstance } from "@notion-kit/table-hook";
import { Kanban } from "@notion-kit/ui/kanban";
import { Button } from "@notion-kit/ui/primitives";

import { GroupActions } from "@/common";
import { useTableViewCtx } from "@/table-contexts";

import { BoardCard } from "./board-card";

interface BoardGroupProps {
  index: number;
  row: RowInstance;
}

export function BoardGroup({ index, row }: BoardGroupProps) {
  const { table, plugins } = useTableViewCtx();
  const uiPlugin = row.groupingColumnId
    ? plugins.getUiPlugin(table.getColumnPlugin(row.groupingColumnId).id)
    : null;

  const addRow = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    table.addRowToGroup(row.id);
  };

  return (
    <table.Subscribe selector={(state) => state.tableGlobal.locked}>
      {(locked) => (
        <Kanban.Column
          data-block-id={row.id}
          role="group"
          aria-label={`Group ${row.id}`}
          id={row.id}
          index={index}
          disabled={locked}
        >
          <Kanban.ColumnHeader>
            <div className="flex max-w-100 items-center overflow-hidden text-sm/6 font-medium whitespace-nowrap">
              {uiPlugin?.renderGroupingValue({
                table: table as never,
                value: table.getGroupingValue(row.id),
              })}
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
      )}
    </table.Subscribe>
  );
}
