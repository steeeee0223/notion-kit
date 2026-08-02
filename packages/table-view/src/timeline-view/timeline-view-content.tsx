import type { TableInstance } from "@notion-kit/table-hook";

import { useTableViewCtx } from "@/table-contexts";

import { useTimelineViewState } from "./use-timeline-view-state";

export function TimelineViewContent() {
  const { table } = useTableViewCtx();

  return (
    <table.Subscribe
      selector={(state) => ({
        columnOrder: state.columnOrder,
        columnsInfo: state.columnsInfo,
        locked: Boolean(state.tableGlobal.locked),
        timeline: state.tableGlobal.timeline!,
      })}
    >
      {(resources) => (
        <TimelineViewContentInner table={table} resources={resources} />
      )}
    </table.Subscribe>
  );
}

function TimelineViewContentInner({
  table,
  resources,
}: {
  table: TableInstance;
  resources: Parameters<typeof useTimelineViewState>[1];
}) {
  const resolution = useTimelineViewState(table, resources);

  if (resolution.status === "pending") {
    return (
      <div
        data-testid="timeline-view-pending"
        data-slot="timeline-view-pending"
      />
    );
  }
  if (resolution.status === "locked-empty") {
    return (
      <div
        data-testid="timeline-view-locked-empty"
        data-slot="timeline-view-locked-empty"
      />
    );
  }

  return (
    <div
      data-testid="timeline-view-ready"
      data-slot="timeline-view-content"
      data-property-id={resolution.property.id}
      data-range={resources.timeline.range}
    />
  );
}
