import type { DragEndEvent } from "@dnd-kit/react";

import type { RowInstance } from "@notion-kit/table-hook";
import { Button, Sortable } from "@notion-kit/ui/primitives";
import {
  TimelineSidebarBody,
  TimelineSidebarClose,
  TimelineSidebarHeader,
  TimelineSidebar as TimelineSidebarPrimitive,
} from "@notion-kit/ui/timeline";

import { TableCell } from "@/common";
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
        <table.Subscribe selector={(state) => state.tableGlobal.locked}>
          {(locked) =>
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

function TimelineSidebarRows({ sortable = false }: { sortable?: boolean }) {
  const { table } = useTableViewCtx();
  const rows = table.getRowModel().rows as RowInstance[];
  const nextIndexByGroup = new Map<string | undefined, number>();

  return rows.map((row) => {
    if (row.getIsGrouped()) {
      return (
        <div
          key={row.id}
          data-slot="timeline-sidebar-group"
          data-row-id={row.id}
        >
          <TableGroupedRow hasSelection={false} row={row} />
        </div>
      );
    }
    const { colId: titleColumnId, cell } = row.getTitleCell();
    const titleColumn = table.getColumn(titleColumnId);
    if (!titleColumn) return null;

    const title = String(cell.value || "New page");
    const index = nextIndexByGroup.get(row.parentId) ?? 0;
    nextIndexByGroup.set(row.parentId, index + 1);
    const content = (
      <Button
        variant="cell"
        className="h-full min-w-0 flex-1 justify-start overflow-hidden px-2 text-sm"
        aria-label={title}
        onClick={() => table.openRow(row.id)}
      >
        <TableCell
          row={row}
          column={titleColumn}
          table={table}
          view="timeline"
        />
      </Button>
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
          <div
            data-slot="timeline-sidebar-row"
            data-row-id={row.id}
            className="flex h-(--timeline-row-height) items-center border-b border-border"
          />
        }
      >
        <Sortable.Handle aria-label={`Move ${title}`} className="ms-1 size-6" />
        {content}
      </Sortable.Item>
    );
  });
}
