import { Icon } from "@notion-kit/icons";
import type { RowInstance } from "@notion-kit/table-hook";
import { Kanban } from "@notion-kit/ui/kanban";
import { Button } from "@notion-kit/ui/primitives";

import { GroupActions } from "@/common";
import { useTableViewCtx } from "@/table-contexts";

import { BoardCard, BoardCardPreview } from "./board-card";

interface BoardGroupProps {
  index: number;
  row: RowInstance;
  cards: RowInstance[];
}

export function BoardGroup({ index, row, cards }: BoardGroupProps) {
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
                {cards.length}
              </Button>
            )}
            <GroupActions
              className="ml-auto opacity-0 group-hover/kanban-column:opacity-100"
              row={row}
            />
          </Kanban.ColumnHeader>
          <Kanban.ColumnContent>
            {cards.map((subRow, itemIndex) => (
              <BoardCard
                key={subRow.id}
                row={subRow}
                groupId={row.id}
                index={itemIndex}
              />
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

export function BoardGroupPreview({ row }: { row: RowInstance }) {
  const { table, plugins } = useTableViewCtx();
  const info = table.getGroupedColumnInfo();
  return (
    <div className="flex w-65 flex-col gap-2 rounded-lg bg-main p-2">
      <div className="text-sm font-medium">
        {info &&
          plugins.getUiPlugin(info.type).renderGroupingValue({
            table: table as never,
            value: table.getGroupingValue(row.id),
          })}
      </div>
      {row.subRows.map((card) => (
        <BoardCardPreview key={card.id} row={card} />
      ))}
    </div>
  );
}
