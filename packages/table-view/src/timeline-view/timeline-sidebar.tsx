import type { DragEndEvent } from "@dnd-kit/react";

import { cn } from "@notion-kit/cn";
import { Button, buttonVariants, Sortable } from "@notion-kit/ui/primitives";
import {
  TimelineSidebarBody,
  TimelineSidebarClose,
  TimelineSidebarHeader,
  TimelineSidebar as TimelineSidebarPrimitive,
} from "@notion-kit/ui/timeline";

import { Cell, Row, RowActionGroup } from "@/common";
import { TableGroupedRow } from "@/table-body";
import { useTableViewCtx } from "@/table-contexts";
import { TableHeaderCellResizer, TableHeaderCellTrigger } from "@/table-header";

interface TimelineSidebarProps {
  onClose: () => void;
  onRowDragEnd: (event: DragEndEvent) => void;
}

export function TimelineSidebar({
  onClose,
  onRowDragEnd,
}: TimelineSidebarProps) {
  const { table } = useTableViewCtx();

  return (
    <table.Subscribe
      selector={(state) => ({
        columnOrder: state.columnOrder,
        columnsInfo: state.columnsInfo,
        columnSizing: state.columnSizing,
        columnResizing: state.columnResizing,
        sorting: state.sorting,
        grouping: state.grouping,
        groupingState: state.groupingState,
        expanded: state.expanded,
        columnVisibility: state.columnVisibility,
        rowSelection: state.rowSelection,
      })}
    >
      {() => (
        <TimelineSidebarContent onClose={onClose} onRowDragEnd={onRowDragEnd} />
      )}
    </table.Subscribe>
  );
}

function TimelineSidebarContent({
  onClose,
  onRowDragEnd,
}: TimelineSidebarProps) {
  const { table } = useTableViewCtx();
  const titleHeader = table
    .getFlatHeaders()
    .find((header) => header.column.getInfo().type === "title");

  if (!titleHeader) return null;

  return (
    <TimelineSidebarPrimitive role="complementary" aria-label="Timeline table">
      <TimelineSidebarHeader className="relative flex h-17 text-secondary shadow-[inset_0_-1px_0_var(--color-border),inset_0_1px_0_var(--color-border)]">
        <Row.ActionPortal className="h-full" />
        <TableHeaderCellTrigger
          header={titleHeader}
          table={table}
          render={
            <Button
              variant="cell"
              className="flex min-w-0 flex-1 items-end gap-1 overflow-hidden px-2 pb-2 text-sm"
            />
          }
        />
        <table.Subscribe selector={(state) => state.tableGlobal.locked}>
          {(locked) =>
            locked ? null : (
              <TableHeaderCellResizer header={titleHeader} table={table} />
            )
          }
        </table.Subscribe>
        <TimelineSidebarClose onClick={onClose} />
      </TimelineSidebarHeader>
      <TimelineSidebarBody>
        <table.Subscribe
          selector={(state) => ({
            locked: state.tableGlobal.locked,
            _rowSelection: state.rowSelection,
          })}
        >
          {({ locked }) =>
            locked ? (
              <TimelineSidebarRows />
            ) : (
              <Sortable.Root orientation="vertical" onDragEnd={onRowDragEnd}>
                <Sortable.List>
                  <TimelineSidebarRows sortable />
                </Sortable.List>
              </Sortable.Root>
            )
          }
        </table.Subscribe>
      </TimelineSidebarBody>
    </TimelineSidebarPrimitive>
  );
}

function TimelineSidebarRows({ sortable }: { sortable?: boolean }) {
  const { table } = useTableViewCtx();
  const rows = table.getRowModel().rows;
  const nextIndexByGroup = new Map<string | undefined, number>();

  return rows.map((row) => {
    if (row.getIsGrouped()) {
      return (
        <div
          key={row.id}
          data-slot="timeline-sidebar-group"
          data-row-id={row.id}
        >
          <TableGroupedRow row={row} />
        </div>
      );
    }
    const { colId: titleColumnId, cell: titleDataCell } = row.getTitleCell();
    const titleCell = row
      .getAllCells()
      .find((candidate) => candidate.column.id === titleColumnId);
    if (!titleCell) return null;

    const title = String(titleDataCell.value || "New page");
    const wrapped = titleCell.getInfo().wrapped;
    const index = nextIndexByGroup.get(row.parentId) ?? 0;
    nextIndexByGroup.set(row.parentId, index + 1);
    const content = (
      <Row.Content
        className={cn(
          buttonVariants({ variant: "cell" }),
          "h-full min-w-0 flex-1 justify-start overflow-hidden px-2 text-sm",
        )}
        aria-label={title}
        onClick={() => table.openRow(row.id)}
      >
        <Cell.Root
          cell={titleCell}
          table={table}
          surface="timeline"
          wrapped={wrapped}
        >
          <Cell.Content />
        </Cell.Root>
      </Row.Content>
    );

    if (!sortable) {
      return (
        <div
          key={row.id}
          data-slot="timeline-sidebar-row"
          data-row-id={row.id}
          className="flex h-(--timeline-row-height) items-center border-b border-border"
        >
          {content}
        </div>
      );
    }

    return (
      <Sortable.Item
        key={row.id}
        id={row.id}
        index={index}
        group={row.parentId}
        data={{ type: "timeline-row", groupId: row.parentId }}
        render={
          <Row.Root
            data-slot="timeline-sidebar-row"
            data-row-id={row.id}
            selected={row.getIsSelected()}
            className="h-(--timeline-row-height) items-center border-b border-border"
          />
        }
      >
        <Row.ActionPortal
          className="h-(--timeline-row-height)"
          display={row.getIsSelected() ? "content" : "none"}
        >
          <RowActionGroup row={row} />
        </Row.ActionPortal>
        {content}
      </Sortable.Item>
    );
  });
}
