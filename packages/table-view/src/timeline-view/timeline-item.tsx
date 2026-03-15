"use client";

import { useCallback, useRef, useState } from "react";
import { flexRender, type Row as TanstackRow } from "@tanstack/react-table";

import { Popover, PopoverContent, PopoverTrigger } from "@notion-kit/shadcn";

import { DefaultIcon } from "../common";
import type { Row } from "../lib/types";
import { RowActionMenu } from "../menus/row-action-menu";
import { useTableViewCtx } from "../table-contexts";
import type { UseTimelineScaleReturn } from "./use-timeline-scale";

interface TimelineItemProps {
  row: TanstackRow<Row>;
  scale: UseTimelineScaleReturn;
}

export function TimelineItem({ row, scale }: TimelineItemProps) {
  const { table } = useTableViewCtx();
  const { locked } = table.getTableGlobalState();
  const range = table.getTimelineItemRange(row.id);
  const [menuOpen, setMenuOpen] = useState(false);

  const resizerRef = useRef<{
    side: "left" | "right";
    startX: number;
    startMs: number;
    endMs: number;
  } | null>(null);

  const left = range ? scale.dateToX(range.start) : scale.todayX;
  const width = range
    ? Math.max((range.end - range.start) * scale.pxPerMs, 11)
    : 11;

  const handleResizeStart = useCallback(
    (side: "left" | "right") => (e: React.PointerEvent) => {
      if (locked || !range) return;
      e.preventDefault();
      e.stopPropagation();
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      resizerRef.current = {
        side,
        startX: e.clientX,
        startMs: range.start,
        endMs: range.end,
      };

      const handleMove = (ev: PointerEvent) => {
        if (!resizerRef.current) return;
        const deltaX = ev.clientX - resizerRef.current.startX;
        const deltaMs = deltaX / scale.pxPerMs;

        if (resizerRef.current.side === "left") {
          const newStart = resizerRef.current.startMs + deltaMs;
          if (newStart < resizerRef.current.endMs) {
            table.updateTimelineRange(
              row.id,
              newStart,
              resizerRef.current.endMs,
            );
          }
        } else {
          const newEnd = resizerRef.current.endMs + deltaMs;
          if (newEnd > resizerRef.current.startMs) {
            table.updateTimelineRange(
              row.id,
              resizerRef.current.startMs,
              newEnd,
            );
          }
        }
      };

      const handleUp = () => {
        resizerRef.current = null;
        target.releasePointerCapture(e.pointerId);
        document.removeEventListener("pointermove", handleMove);
        document.removeEventListener("pointerup", handleUp);
      };

      document.addEventListener("pointermove", handleMove);
      document.addEventListener("pointerup", handleUp);
    },
    [locked, range, scale.pxPerMs, table, row.id],
  );

  const titleCell = row.getTitleCell();
  const titleValue = titleCell.cell.value as { title?: string };
  const displayTitle = titleValue.title ?? "Untitled";

  const visibleCells = row
    .getVisibleCells()
    .filter((cell) => cell.column.id !== titleCell.colId);

  return (
    <Popover open={menuOpen} onOpenChange={setMenuOpen}>
      <PopoverTrigger asChild>
        <div
          className="notion-timeline-item-row flex h-9 w-full cursor-default"
          style={{ isolation: "auto" }}
          onContextMenu={(e) => {
            e.preventDefault();
            setMenuOpen(true);
          }}
        >
          <div
            className="notion-timeline-item absolute my-px flex rounded-md bg-[var(--c-popBac)] shadow-[var(--c-shaOutMd)]"
            style={{
              insetInlineStart: left,
              width,
              height: 34,
              zIndex: 85,
            }}
          >
            <button
              type="button"
              className="flex h-full w-full cursor-pointer rounded-md"
              style={{ paddingInline: 6 }}
              onClick={() => table.openRow(row.id)}
            />
            {!locked && (
              <>
                <div
                  className="notion-timeline-item-resizer-left absolute start-[-6px] top-0 z-[1] h-full w-2 cursor-col-resize"
                  onPointerDown={handleResizeStart("left")}
                />
                <div
                  className="notion-timeline-item-resizer-right absolute end-[-6px] top-0 z-[1] h-full w-2 cursor-col-resize"
                  onPointerDown={handleResizeStart("right")}
                />
              </>
            )}
          </div>
          <div
            className="pointer-events-none w-full"
            style={{ zIndex: 85, opacity: 1 }}
          >
            <div
              className="notion-timeline-item-properties absolute flex h-[34px] overflow-hidden"
              style={{
                paddingInlineStart: 6,
                width: 800,
                insetInlineStart: left,
              }}
            >
              <div className="me-2.5 flex items-center text-sm font-medium">
                {row.original.icon && (
                  <div className="ms-0.5 me-1.5 flex size-5 shrink-0 items-center justify-center rounded">
                    <DefaultIcon type="title" />
                  </div>
                )}
                <div className="max-w-[400px] truncate">{displayTitle}</div>
              </div>
              {visibleCells.length > 0 && (
                <div className="relative flex cursor-default items-center gap-1.5 text-xs">
                  {visibleCells.map((cell) => (
                    <div key={cell.id} style={{ display: "contents" }}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-64"
        side="bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <RowActionMenu rowId={row.id} />
      </PopoverContent>
    </Popover>
  );
}
