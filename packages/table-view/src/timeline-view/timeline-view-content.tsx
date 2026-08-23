import { useCallback, useState } from "react";
import type { DragEndEvent } from "@dnd-kit/react";
import type { SortingState } from "@tanstack/react-table";

import { AlertModal } from "@notion-kit/ui/alert-modal";
import { Dialog } from "@notion-kit/ui/primitives";
import {
  TimelineContent,
  TimelineHeaderToolbar,
  TimelineList,
  TimelineProvider,
  TimelineRangeHeader,
  TimelineToday,
} from "@notion-kit/ui/timeline";

import { BulkEditBar } from "@/common/bulk-edit/bulk-edit-bar";
import { useTableViewCtx } from "@/table-contexts";

import { TimelineSidebar } from "./timeline-sidebar";
import { TimelineTrackRow } from "./timeline-track-row";
import { useTimelineViewState } from "./use-timeline-view-state";

type TimelineViewResolutionResources = Parameters<
  typeof useTimelineViewState
>[0];

interface TimelineViewReadyResources {
  sorting: SortingState;
  locked: boolean;
  timeline: TimelineViewResolutionResources["timeline"];
}

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
      {(resources) => <TimelineViewContentInner resources={resources} />}
    </table.Subscribe>
  );
}

function TimelineViewContentInner({
  resources,
}: {
  resources: TimelineViewResolutionResources;
}) {
  const resolution = useTimelineViewState(resources);

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

  return <TimelineViewReady propertyId={resolution.property.id} />;
}

function TimelineViewReady({ propertyId }: { propertyId: string }) {
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
        locked: Boolean(state.tableGlobal.locked),
        timeline: state.tableGlobal.timeline!,
      })}
    >
      {(resources) => (
        <TimelineViewReadyContent
          propertyId={propertyId}
          resources={resources}
        />
      )}
    </table.Subscribe>
  );
}

function TimelineViewReadyContent({
  propertyId,
  resources,
}: {
  propertyId: string;
  resources: TimelineViewReadyResources;
}) {
  const { table } = useTableViewCtx();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendingDragEndEvent, setPendingDragEndEvent] =
    useState<DragEndEvent | null>(null);
  const rows = table.getRowModel().rows;
  const titleHeader = table
    .getFlatHeaders()
    .find((header) => header.column.getInfo().type === "title");

  const handleRowDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (event.canceled) return;
      if (resources.sorting.length === 0) {
        table.handleRowDragEnd(event);
        return;
      }
      setPendingDragEndEvent(event);
    },
    [resources.sorting.length, table],
  );

  const handleConfirmRemoveSorting = () => {
    if (pendingDragEndEvent) {
      table.resetSorting();
      table.handleRowDragEnd(pendingDragEndEvent);
    }
    setPendingDragEndEvent(null);
  };

  if (!titleHeader) return null;

  return (
    <>
      <TimelineProvider
        className="min-h-80"
        range={resources.timeline.range}
        sidebarWidth={sidebarOpen ? titleHeader.column.getSize() : 0}
      >
        <TimelineContent
          data-testid="timeline-view-ready"
          data-slot="timeline-view-content"
          data-property-id={propertyId}
          data-range={resources.timeline.range}
        >
          <BulkEditBar disabled={resources.locked} />
          <TimelineRangeHeader />
          <TimelineList>
            {rows.map((row) => (
              <TimelineTrackRow
                key={row.id}
                row={row}
                propertyId={propertyId}
              />
            ))}
          </TimelineList>
          <TimelineToday />
          <TimelineHeaderToolbar
            onRangeChange={table.setTimelineRange}
            rangeDisabled={resources.locked}
            onSidebarOpen={sidebarOpen ? undefined : () => setSidebarOpen(true)}
          />
        </TimelineContent>
        {sidebarOpen && (
          <TimelineSidebar
            onClose={() => setSidebarOpen(false)}
            onRowDragEnd={handleRowDragEnd}
          />
        )}
      </TimelineProvider>
      <Dialog
        open={pendingDragEndEvent !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDragEndEvent(null);
        }}
      >
        <AlertModal
          title="Would you like to remove sorting?"
          primary="Remove"
          secondary="Don't remove"
          onTrigger={handleConfirmRemoveSorting}
        />
      </Dialog>
    </>
  );
}
