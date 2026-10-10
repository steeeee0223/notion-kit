import { Icon } from "@notion-kit/icons";
import type {
  ExtendedGroupingTableState,
  RowInstance,
  TableGlobalState,
} from "@notion-kit/table-hook";
import { TableViewMenuPage } from "@notion-kit/table-hook";
import { AlertModal } from "@notion-kit/ui/alert-modal";
import { Kanban, KanbanDnd } from "@notion-kit/ui/kanban";
import { Button, Dialog } from "@notion-kit/ui/primitives";

import { Table } from "@/common";
import { useTableViewCtx } from "@/table-contexts";

import { BoardCardPreview } from "./board-card";
import { BoardGroup, BoardGroupPreview } from "./board-group";
import { useBoardDnd } from "./use-board-dnd";

export function BoardViewContent() {
  const { table } = useTableViewCtx();

  return (
    <Table.Content
      data-notion-slot="notion-board-view"
      className="relative float-start"
    >
      <div className="contain-layout">
        <table.Subscribe
          selector={(state) => ({
            grouping: state.grouping,
            tableGlobal: state.tableGlobal,
            groupingState: state.groupingState,
            sorting: state.sorting,
            expanded: state.expanded,
            columnOrder: state.columnOrder,
            columnVisibility: state.columnVisibility,
            columnsInfo: state.columnsInfo,
          })}
        >
          {({ grouping, groupingState, tableGlobal }) => (
            <BoardColumns
              grouping={grouping}
              groupingState={groupingState}
              tableGlobal={tableGlobal}
            />
          )}
        </table.Subscribe>
      </div>
    </Table.Content>
  );
}

function BoardColumns({
  grouping,
  groupingState,
  tableGlobal,
}: {
  grouping: string[];
  groupingState: ExtendedGroupingTableState["groupingState"];
  tableGlobal: TableGlobalState;
}) {
  const { table } = useTableViewCtx();
  const handlers = useBoardDnd();
  const { groupOrder, groupVisibility } = groupingState;
  const groupedRowsById = table.getRowModel().rowsById;
  const columnOrder = groupOrder.filter(
    (id) =>
      (groupVisibility[id] ?? true) &&
      (!groupingState.hideEmptyGroups || !!groupedRowsById[id]?.subRows.length),
  );
  const value = {
    columnOrder,
    items: Object.fromEntries(
      columnOrder.map((id) => [
        id,
        groupedRowsById[id]?.subRows.map((row) => row.id) ?? [],
      ]),
    ),
  };
  const getGroup = (id: string) =>
    (groupedRowsById[id] ?? table.getPlaceholderGroupedRow(id)) as RowInstance;

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
      <Kanban.Root
        value={value}
        onMove={handlers.onMove}
        canMove={handlers.canMove}
        disabled={tableGlobal.locked}
        contextKey={JSON.stringify([
          grouping,
          tableGlobal.layout,
          tableGlobal.pluginMethods?.groupingMethodByColumn,
          tableGlobal.locked,
        ])}
        renderOverlay={(source) => {
          const row = groupedRowsById[source.id];
          return source.type === KanbanDnd.Item ? (
            row && <BoardCardPreview row={row} />
          ) : (
            <BoardGroupPreview row={getGroup(source.id)} />
          );
        }}
      >
        {(projected) =>
          projected.columnOrder.map((groupId, index) => (
            <BoardGroup
              key={groupId}
              row={getGroup(groupId)}
              index={index}
              cards={(projected.items[groupId] ?? []).flatMap((id) => {
                const row = groupedRowsById[id];
                return row ? [row] : [];
              })}
            />
          ))
        }
      </Kanban.Root>
      <Dialog
        open={handlers.pendingMove !== null}
        onOpenChange={(open) => {
          if (!open) handlers.cancelMove();
        }}
      >
        <AlertModal
          title="Would you like to remove sorting?"
          primary="Remove"
          secondary="Don't remove"
          onTrigger={handlers.confirmMove}
        />
      </Dialog>
    </div>
  );
}
