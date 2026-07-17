import { Icon } from "@notion-kit/icons";
import { TableViewMenuPage, type RowInstance } from "@notion-kit/table-hook";
import { Kanban } from "@notion-kit/ui/kanban";
import { Button } from "@notion-kit/ui/primitives";

import { useTableViewCtx } from "@/table-contexts";

import { BoardGroup } from "./board-group";
import { useBoardDnd } from "./use-board-dnd";

export function BoardViewContent() {
  const { table } = useTableViewCtx();

  return (
    <table.Subscribe
      selector={(state) => ({
        locked: state.tableGlobal.locked,
        grouping: state.grouping,
        groupingState: state.groupingState,
        sorting: state.sorting,
        expanded: state.expanded,
        columnOrder: state.columnOrder,
        columnVisibility: state.columnVisibility,
        columnsInfo: state.columnsInfo,
      })}
    >
      {({ locked, grouping, groupingState }) => (
        <BoardViewContentInner
          locked={locked ?? false}
          grouping={grouping}
          groupingState={groupingState}
        />
      )}
    </table.Subscribe>
  );
}

function BoardViewContentInner({
  locked,
  grouping,
  groupingState,
}: {
  locked: boolean;
  grouping: ReturnType<
    typeof useTableViewCtx
  >["table"]["store"]["state"]["grouping"];
  groupingState: ReturnType<
    typeof useTableViewCtx
  >["table"]["store"]["state"]["groupingState"];
}) {
  const { table } = useTableViewCtx();
  const handlers = useBoardDnd();
  const groupedRowsById = table.getRowModel().rowsById;
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
              const row = (groupedRowsById[groupId] ??
                table.getPlaceholderGroupedRow(groupId)) as RowInstance;
              return (
                <BoardGroup
                  key={groupId}
                  row={row}
                  index={index}
                  locked={locked}
                />
              );
            })}
          </Kanban.Root>
        </div>
      </div>
    </div>
  );
}
