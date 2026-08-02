import type { RowInstance, TableInstance } from "@notion-kit/table-hook";
import { Button } from "@notion-kit/ui/primitives";
import { TimelineAddFeatureHelper, TimelineRow } from "@notion-kit/ui/timeline";

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
        <TimelineRow
          item={feature}
          onMove={locked ? undefined : updateRange}
          render={() => (
            <TimelineBarContent
              title={title}
              onOpen={() => table.openRow(row.id)}
            />
          )}
        />
      ) : (
        <div
          data-slot="timeline-empty-track"
          className="relative h-(--timeline-row-height)"
        >
          {locked ? null : (
            <TimelineAddFeatureHelper
              top={18}
              ariaLabel={`Add date to ${title}`}
              className="size-8"
              onAddItem={addDate}
            />
          )}
        </div>
      )}
    </div>
  );
}

function TimelineBarContent({
  title,
  onOpen,
}: {
  title: string;
  onOpen: () => void;
}) {
  return (
    <Button
      variant="hint"
      className="me-2.5 h-full min-w-0 justify-start overflow-hidden px-1.5 text-xs font-medium"
      aria-label={title}
      onClick={onOpen}
    >
      <span className="truncate">{title}</span>
    </Button>
  );
}
