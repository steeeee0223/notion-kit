import { Icon } from "@notion-kit/icons";
import type { RowInstance } from "@notion-kit/table-hook";
import { TableViewMenuPage } from "@notion-kit/table-hook";
import { Kanban } from "@notion-kit/ui/kanban";
import { Button } from "@notion-kit/ui/primitives";

import { useTableViewCtx } from "@/table-contexts";

import { BoardGroup } from "./board-group";
import { useBoardDnd } from "./use-board-dnd";

export function BoardViewContent() {
  const { table } = useTableViewCtx();
  const handlers = useBoardDnd();

  return (
    <div data-slot="notion-board-view" className="relative float-start px-24">
      <div className="contain-layout">
        <table.Subscribe
          selector={(state) => ({
            grouping: state.grouping,
            groupingState: state.groupingState,
            sorting: state.sorting,
            expanded: state.expanded,
            columnOrder: state.columnOrder,
            columnVisibility: state.columnVisibility,
            columnsInfo: state.columnsInfo,
          })}
        >
          {({ grouping, groupingState }) => {
            const { groupOrder, groupVisibility } = groupingState;
            const groupedRowsById = table.getRowModel().rowsById;

            return (
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
                  {groupOrder
                    .filter((groupId) => groupVisibility[groupId] ?? true)
                    .map((groupId, index) => {
                      const row = (groupedRowsById[groupId] ??
                        table.getPlaceholderGroupedRow(groupId)) as RowInstance;
                      return (
                        <BoardGroup key={groupId} row={row} index={index} />
                      );
                    })}
                </Kanban.Root>
              </div>
            );
          }}
        </table.Subscribe>
      </div>
    </div>
  );
}
