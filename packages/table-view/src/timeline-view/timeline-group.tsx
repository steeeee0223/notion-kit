"use client";

import type { Row as TanstackRow } from "@tanstack/react-table";

import { Icon } from "@notion-kit/icons";

import type { Row } from "../lib/types";
import { useTableViewCtx } from "../table-contexts";
import { TimelineItem } from "./timeline-item";
import type { UseTimelineScaleReturn } from "./use-timeline-scale";

interface TimelineGroupProps {
  row: TanstackRow<Row>;
  scale: UseTimelineScaleReturn;
}

export function TimelineGroup({ row, scale }: TimelineGroupProps) {
  const { table } = useTableViewCtx();
  const { locked } = table.getTableGlobalState();
  const { groupVisibility } = table.getState().groupingState;
  const isVisible = groupVisibility[row.id] ?? true;

  return (
    <div className="relative w-full" style={{ paddingBottom: 36 }}>
      <button
        type="button"
        className="sticky start-2 z-[86] flex h-8 cursor-pointer items-center gap-1.5 text-sm font-medium"
        onClick={() => row.toggleGroupVisibility()}
      >
        <Icon.ChevronDown
          className={`size-3.5 text-[var(--c-icoSec)] transition-transform ${!isVisible ? "-rotate-90" : ""}`}
        />
        <span>{row.renderGroupingValue({})}</span>
        <span className="text-[var(--c-texSec)]">{row.subRows.length}</span>
      </button>
      {isVisible && (
        <div style={{ contain: "layout" }}>
          {row.subRows.map((subRow) => (
            <TimelineItem key={subRow.id} row={subRow} scale={scale} />
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
                  onClick={() => table.addRowToGroup(row.id)}
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
  );
}
