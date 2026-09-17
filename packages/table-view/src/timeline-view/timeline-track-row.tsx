import { useRef, useState } from "react";

import { cn } from "@notion-kit/cn";
import type { RowInstance } from "@notion-kit/table-hook";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@notion-kit/ui/primitives";
import { TimelineAddFeatureTrack, TimelineRow } from "@notion-kit/ui/timeline";

import { Cell } from "@/common";
import { useEditLog } from "@/edit-log/edit-log-provider";
import { RowActionMenu } from "@/menus";
import { useTableViewCtx } from "@/table-contexts";

import {
  createEmptyTrackDate,
  createTimelineCellUpdater,
  toTimelineFeature,
} from "./timeline-adapter";

interface TimelineTrackRowProps {
  row: RowInstance;
  propertyId: string;
}

export function TimelineTrackRow({ row, propertyId }: TimelineTrackRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const { isOpen } = useEditLog();
  const { table } = useTableViewCtx();

  if (row.getIsGrouped()) {
    return (
      <div
        data-slot="timeline-group-spacer"
        data-row-id={row.id}
        style={{ height: 44 }}
      />
    );
  }

  const { cell } = row.getTitleCell();
  const title = String(cell.value || "New page");
  const feature = toTimelineFeature(row.original, propertyId, title);

  return (
    <table.Subscribe
      selector={(state) => ({
        locked: state.tableGlobal.locked,
        rowSelection: state.rowSelection,
      })}
    >
      {({ locked, rowSelection }) => {
        const updateRange = (
          _rowId: string,
          start: number,
          end: number | null,
        ) => {
          if (locked || end === null) return;
          table.updateCell(
            row.id,
            propertyId,
            createTimelineCellUpdater(start, end),
          );
        };
        const addDate = (start: number) => {
          if (locked) return;
          table.updateCell(row.id, propertyId, (cell) => ({
            ...cell,
            value: createEmptyTrackDate(start),
          }));
        };

        return (
          <div
            data-slot="timeline-track-row"
            data-row-id={row.id}
            className={cn(rowSelection[row.id] && "bg-blue/10")}
          >
            {feature ? (
              <TimelineRow.Root
                item={feature}
                onMove={locked ? undefined : updateRange}
              >
                <TimelineRow.Jump />
                <TimelineRow.Track>
                  {locked ? (
                    <TimelineRow.Item
                      aria-label={title}
                      onClick={() => table.openRow(row.id)}
                    >
                      <TimelineBarContent rowId={row.id} />
                    </TimelineRow.Item>
                  ) : (
                    <>
                      <TimelineRow.Resize direction="start" />
                      <ContextMenu open={menuOpen} onOpenChange={setMenuOpen}>
                        <ContextMenuTrigger
                          ref={triggerRef}
                          render={
                            <TimelineRow.Item
                              aria-label={title}
                              onClick={() => table.openRow(row.id)}
                            />
                          }
                        >
                          <TimelineBarContent rowId={row.id} />
                        </ContextMenuTrigger>
                        <ContextMenuContent
                          className="w-[265px]"
                          finalFocus={() =>
                            isOpen() ? false : triggerRef.current
                          }
                        >
                          <RowActionMenu
                            rowId={row.id}
                            onClose={() => setMenuOpen(false)}
                            getReturnFocus={() => triggerRef.current}
                          />
                        </ContextMenuContent>
                      </ContextMenu>
                      <TimelineRow.Resize direction="end" />
                    </>
                  )}
                </TimelineRow.Track>
              </TimelineRow.Root>
            ) : (
              <div
                data-slot="timeline-empty-track"
                className="relative h-(--timeline-row-height)"
              >
                {locked ? null : (
                  <TimelineAddFeatureTrack
                    ariaLabel={`Add date to ${title}`}
                    onAddItem={addDate}
                  />
                )}
              </div>
            )}
          </div>
        );
      }}
    </table.Subscribe>
  );
}

function TimelineBarContent({ rowId }: { rowId: string }) {
  const { table } = useTableViewCtx();
  const row = table.getRow(rowId) as RowInstance;
  const { colId } = row.getTitleCell();
  const titleCell = row
    .getAllCells()
    .find((candidate) => candidate.column.id === colId);

  if (!titleCell) return null;

  return (
    <span className="me-2.5 flex min-w-0 items-center gap-1.5 overflow-hidden text-sm font-normal">
      <Cell.Root cell={titleCell} table={table} surface="timeline">
        <Cell.Content />
      </Cell.Root>
    </span>
  );
}
