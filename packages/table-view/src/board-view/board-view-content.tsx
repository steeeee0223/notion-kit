import { Icon } from "@notion-kit/icons";
import { Kanban } from "@notion-kit/ui/kanban";
import { Button } from "@notion-kit/ui/primitives";

import { TableViewMenuPage } from "@/features";
import { useTableViewCtx } from "@/table-contexts";

import { BoardGroup } from "./board-group";
import { useBoardDnd } from "./use-board-dnd";

export function BoardViewContent() {
  const { table } = useTableViewCtx();
  const handlers = useBoardDnd();
  const groupedRowsById = table.getGroupedRowModel().rowsById;
  const { grouping, groupingState } = table.getState();
  const { groupOrder } = groupingState;

  return (
    <div data-slot="notion-board-view" className="relative float-start px-24">
      <div className="contain-layout">
        <div
          data-block-id="1fe35e0f-492c-80fd-8d7c-f7e953641770"
          className="relative flex min-w-full grow py-2"
        >
          {grouping.length === 0 && (
            <div className="flex justify-center">
              <Button
                size="sm"
                className="text-secondary"
                onClick={() =>
                  table.setTableMenuState({
                    open: true,
                    page: TableViewMenuPage.SelectGroupBy,
                  })
                }
              >
                <Icon.SquareGridBelowLines />
                Select a grouping property
              </Button>
            </div>
          )}
          <Kanban.Root {...handlers}>
            {groupOrder.map((groupId, index) => {
              const row =
                groupedRowsById[groupId] ??
                table.getPlaceholderGroupedRow(groupId);
              return <BoardGroup key={groupId} row={row} index={index} />;
            })}
          </Kanban.Root>
        </div>
      </div>
    </div>
  );
}
