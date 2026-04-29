import { useCallback, useMemo } from "react";

import {
  TimelineContent,
  TimelineHeaderToolbar,
  TimelineList,
  TimelineProvider,
  TimelineRangeHeader,
  TimelineRow,
  TimelineToday,
  type TimelineFeature,
} from "@notion-kit/timeline";

import { useTableViewCtx } from "../table-contexts";
import { TimelineSidebarContent } from "./timeline-sidebar-content";

export function TimelineViewContent() {
  const { table } = useTableViewCtx();
  const { sidebarVisible, range } = table.getTimelineState();

  const titleColId = table.getTitleColumnId();
  const titleColSize = table.getColumn(titleColId)?.getSize() ?? 0;
  // const sidebarWidth = sidebarVisible ? titleColSize : 0;

  /** Build TimelineFeature items from table rows */
  const rows = table.getRowModel().rows;

  const features = useMemo(() => {
    return rows.flatMap<TimelineFeature>((row) => {
      const itemRange = table.getTimelineItemRange(row.id);
      if (!itemRange) return [];

      const { cell } = row.getTitleCell();
      return {
        id: row.id,
        name: cell.value,
        startAt: itemRange.start,
        endAt: itemRange.end,
      };
    });
  }, [rows, table]);

  const handleMoveFeature = useCallback(
    (id: string, startAt: number, endAt: number | null) => {
      if (!endAt) return;
      table.updateTimelineRange(id, startAt, endAt);
    },
    [table],
  );

  return (
    <TimelineProvider
      className="border"
      range={range}
      sidebarWidth={titleColSize}
    >
      <TimelineContent>
        {/* 1. 3. Timeline range header with columns */}
        <TimelineRangeHeader />
        {/* 2. Timeline rows */}
        <TimelineList>
          {features.map((feature) => (
            <TimelineRow
              key={feature.id}
              onMove={handleMoveFeature}
              item={feature}
              render={() => (
                <div
                  role="button"
                  className="me-2.5 flex w-full items-center gap-1.5 text-sm font-medium"
                >
                  <div className="max-w-100 truncate text-xs">
                    {feature.name}
                  </div>
                </div>
              )}
            />
          ))}
        </TimelineList>
        <TimelineToday />
        {/* 4. Timeline header toolbar */}
        <TimelineHeaderToolbar
          onRangeChange={table.setTimelineRange}
          onSidebarOpen={table.toggleSidebar}
        />
        {/* 5. Timeline rows with NO CHILD??? */}
      </TimelineContent>
      {/* 4.1 Sidebar */}
      {sidebarVisible && <TimelineSidebarContent />}
    </TimelineProvider>
  );
}
