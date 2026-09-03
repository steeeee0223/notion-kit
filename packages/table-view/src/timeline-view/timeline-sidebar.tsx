import type { MouseEvent } from "react";
import type { DragEndEvent } from "@dnd-kit/react";

import { useIsMobile } from "@notion-kit/hooks";
import { Button, Sortable } from "@notion-kit/ui/primitives";
import {
  TimelineSidebarBody,
  TimelineSidebarClose,
  TimelineSidebarHeader,
  TimelineSidebar as TimelineSidebarPrimitive,
} from "@notion-kit/ui/timeline";

import { Cell, RowActionGroup } from "@/common";
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
    <TimelineSidebarPrimitive
      role="complementary"
      aria-label="Timeline table"
      className="[--table-view-inline-start:0.25rem] [--table-view-pinned-start:5.25rem]"
    >
      <TimelineSidebarHeader className="relative flex h-17 text-secondary shadow-[inset_0_-1px_0_var(--color-border),inset_0_1px_0_var(--color-border)]">
        <div
          data-slot="timeline-sidebar-action-gutter"
          className="ms-(--table-view-inline-start) w-(--table-view-row-action-gutter) shrink-0"
        />
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

function TimelineSidebarRows({ sortable }: { sortable?: boolean }) {
  const { table } = useTableViewCtx();
  const isMobile = useIsMobile();
  const rows = table.getRowModel().rows;
  const nextIndexByGroup = new Map<string | undefined, number>();

  return rows.map((row) => {
    if (row.getIsGrouped()) {
      return (
        <div
          key={row.id}
          data-slot="timeline-sidebar-group"
          data-row-id={row.id}
          className="ps-(--table-view-inline-start)"
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
    const wrapped = titleCell.column.getInfo().wrapped;
    const index = nextIndexByGroup.get(row.parentId) ?? 0;
    nextIndexByGroup.set(row.parentId, index + 1);
    const content = (
      <Button
        variant="cell"
        className="sticky inset-s-(--table-view-pinned-start) h-full min-w-0 flex-1 justify-start overflow-hidden bg-main px-2 text-sm"
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
          <div
            data-slot="timeline-sidebar-row-action-gutter"
            className="ms-(--table-view-inline-start) w-(--table-view-row-action-gutter) shrink-0"
          />
          {content}
        </div>
      );
    }

    const addNextRow = (event: MouseEvent) => {
      table.addRow({
        id: row.id,
        at: event.altKey ? "prev" : "next",
      });
    };

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
            className="group/row flex h-(--timeline-row-height) items-center border-b border-border"
          />
        }
      >
        <div
          data-slot="timeline-sidebar-row-action-gutter"
          className="sticky inset-s-(--table-view-inline-start) z-(--z-row) ms-(--table-view-inline-start) flex w-(--table-view-row-action-gutter) shrink-0 items-center bg-main"
        >
          <RowActionGroup
            className="w-full"
            isMobile={isMobile}
            row={row}
            onAddNext={addNextRow}
          />
        </div>
        {content}
      </Sortable.Item>
    );
  });
}
