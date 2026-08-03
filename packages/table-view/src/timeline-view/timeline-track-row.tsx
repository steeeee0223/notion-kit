import type { RowInstance, TableInstance } from "@notion-kit/table-hook";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@notion-kit/ui/primitives";
import { TimelineAddFeatureTrack, TimelineRow } from "@notion-kit/ui/timeline";

import { RowActionMenu } from "@/menus";

import {
  createEmptyTrackDate,
  createTimelineCellUpdater,
  toTimelineFeature,
} from "./timeline-adapter";

interface TimelineTrackRowProps {
  row: RowInstance;
  propertyId: string;
  locked: boolean;
  table: TableInstance;
}

export function TimelineTrackRow({
  row,
  propertyId,
  locked,
  table,
}: TimelineTrackRowProps) {
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
  const updateRange = (_rowId: string, start: number, end: number | null) => {
    if (locked || end === null) return;
    table.updateCell(row.id, propertyId, createTimelineCellUpdater(start, end));
  };
  const addDate = (start: number) => {
    if (locked) return;
    table.updateCell(row.id, propertyId, (cell) => ({
      ...cell,
      value: createEmptyTrackDate(start),
    }));
  };

  return (
    <div data-slot="timeline-track-row" data-row-id={row.id}>
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
                <TimelineBarContent title={title} />
              </TimelineRow.Item>
            ) : (
              <>
                <TimelineRow.Resize direction="start" />
                <ContextMenu>
                  <ContextMenuTrigger
                    render={
                      <TimelineRow.Item
                        aria-label={title}
                        onClick={() => table.openRow(row.id)}
                      />
                    }
                  >
                    <TimelineBarContent title={title} />
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-[265px]">
                    <RowActionMenu rowId={row.id} />
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
}

function TimelineBarContent({ title }: { title: string }) {
  return (
    <span className="me-2.5 min-w-0 overflow-hidden text-xs font-medium">
      <span className="truncate">{title}</span>
    </span>
  );
}
