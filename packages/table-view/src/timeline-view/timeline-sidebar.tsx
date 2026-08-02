import type { DragEndEvent } from "@dnd-kit/react";

import type {
  HeaderInstance,
  RowInstance,
  TableInstance,
} from "@notion-kit/table-hook";
import { Button, Sortable } from "@notion-kit/ui/primitives";
import {
  TimelineSidebarBody,
  TimelineSidebarClose,
  TimelineSidebarHeader,
  TimelineSidebar as TimelineSidebarPrimitive,
} from "@notion-kit/ui/timeline";

import { TableGroupedRow } from "../table-body";
import {
  TableHeaderCellResizer,
  TableHeaderCellTrigger,
} from "../table-header";

interface TimelineSidebarProps {
  rows: RowInstance[];
  table: TableInstance;
  titleHeader: HeaderInstance;
  onClose: () => void;
  onRowDragEnd: (event: DragEndEvent) => void;
}

export function TimelineSidebar({
  rows,
  table,
  titleHeader,
  onClose,
  onRowDragEnd,
}: TimelineSidebarProps) {
  const { locked } = table.getTableGlobalState();
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
        {locked ? null : (
          <TableHeaderCellResizer header={titleHeader} table={table} />
        )}
        <TimelineSidebarClose onClick={onClose} />
      </TimelineSidebarHeader>
      <TimelineSidebarBody>
        {locked ? (
          <TimelineSidebarRows rows={rows} table={table} />
        ) : (
          <Sortable.Root orientation="vertical" onDragEnd={onRowDragEnd}>
            <Sortable.List>
              <TimelineSidebarRows rows={rows} table={table} sortable />
            </Sortable.List>
          </Sortable.Root>
        )}
      </TimelineSidebarBody>
    </TimelineSidebarPrimitive>
  );
}

function TimelineSidebarRows({
  rows,
  table,
  sortable = false,
}: {
  rows: RowInstance[];
  table: TableInstance;
  sortable?: boolean;
}) {
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
    const { cell } = row.getTitleCell();
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
        <span className="truncate">{title}</span>
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
