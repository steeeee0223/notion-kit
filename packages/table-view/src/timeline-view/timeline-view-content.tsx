"use client";

import { useCallback, useRef } from "react";

import { Icon } from "@notion-kit/icons";
import { Button } from "@notion-kit/shadcn";

import { useTableViewCtx } from "../table-contexts";
import { TimelineGrid } from "./timeline-grid";
import { TimelineGroup } from "./timeline-group";
import { TimelineHeader } from "./timeline-header";
import { TimelineItem } from "./timeline-item";
import { TimelineSidebar } from "./timeline-sidebar";
import { useTimelineScale } from "./use-timeline-scale";

export function TimelineViewContent() {
  const { table } = useTableViewCtx();
  const { unit, scrollOrigin, sidebarVisible } = table.getTimelineState();
  const { locked } = table.getTableGlobalState();
  const { grouping } = table.getState();
  const isGrouped = grouping.length > 0;

  const scale = useTimelineScale(unit, scrollOrigin);
  const scrollRef = useRef<HTMLDivElement>(null);

  const rows = isGrouped
    ? table.getGroupedRowModel().rows
    : table.getRowModel().rows;

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 200;
    if (el.scrollLeft < threshold) {
      table.scrollToPrev();
      el.scrollLeft += scale.totalWidth / 4;
    } else if (el.scrollLeft + el.clientWidth > el.scrollWidth - threshold) {
      table.scrollToNext();
    }
  }, [table, scale.totalWidth]);

  return (
    <div
      className="notion-timeline-view relative min-w-full bg-[var(--c-timBac)]"
      style={{ float: "inline-start" }}
    >
      <div className="flex">
        {sidebarVisible && <TimelineSidebar />}

        <div
          ref={scrollRef}
          className="relative grow overflow-auto"
          onScroll={handleScroll}
        >
          <div className="relative" style={{ width: scale.totalWidth }}>
            <TimelineHeader scale={scale} />
            <TimelineGrid scale={scale} />

            <div
              className="relative"
              style={{ top: 0, width: scale.totalWidth }}
            >
              {isGrouped ? (
                <div className="flex flex-col">
                  {rows.map((row) => (
                    <TimelineGroup key={row.id} row={row} scale={scale} />
                  ))}
                </div>
              ) : (
                <div>
                  {rows.map((row) => (
                    <TimelineItem key={row.id} row={row} scale={scale} />
                  ))}
                  {!locked && (
                    <div
                      className="notion-timeline-item-row flex h-9 w-full cursor-default"
                      style={{ isolation: "auto" }}
                    >
                      <div
                        className="sticky start-2 flex items-center gap-1.5 pb-0.5 text-sm leading-5"
                        data-timeline-add-row-indicator="true"
                      >
                        <button
                          type="button"
                          className="flex items-center gap-1.5 text-[var(--c-texSec)]"
                          onClick={() => table.addRow()}
                        >
                          <Icon.Plus className="size-4 fill-[var(--c-icoSec)]" />
                          <span>New</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed start-1/2 bottom-4 z-[110] -translate-x-1/2">
        <div className="pointer-events-auto flex items-center gap-1 rounded-lg border border-[var(--ca-borSecTra)] bg-[var(--c-popBac)] px-1 py-0.5 shadow-md">
          <Button variant="hint" size="xs" onClick={() => table.scrollToPrev()}>
            <Icon.ChevronRight className="size-4 rotate-180" />
          </Button>
          <Button
            variant="hint"
            size="xs"
            onClick={() => table.scrollToToday()}
          >
            Today
          </Button>
          <Button variant="hint" size="xs" onClick={() => table.scrollToNext()}>
            <Icon.ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
