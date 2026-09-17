import { useRef, useState } from "react";

import type { ColumnInfo } from "@notion-kit/table-hook";
import {
  CalendarContent,
  CalendarEvent,
  CalendarHeaderToolbar,
  CalendarProvider,
  type CalendarEventData,
  type CalendarEventRenderProps,
} from "@notion-kit/ui/calendar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@notion-kit/ui/primitives";

import { Cell, Table } from "@/common";
import { getDatePropertyTimeZone } from "@/date-view/date-property";
import { useDateViewNavigation } from "@/date-view/date-view-navigation-provider";
import {
  useDateViewProperty,
  type DateViewResources,
} from "@/date-view/use-date-view-property";
import { useEditLog } from "@/edit-log/edit-log-provider";
import { RowActionMenu } from "@/menus";
import { useTableViewCtx } from "@/table-contexts";

import { getCalendarRows, toCalendarEvent } from "./calendar-adapter";
import { useCalendarActions } from "./use-calendar-actions";

const initialization = { name: "Date" };

export function CalendarViewContent() {
  const { table } = useTableViewCtx();
  return (
    <table.Subscribe
      selector={(state) => ({
        columnOrder: state.columnOrder,
        columnsInfo: state.columnsInfo,
        locked: Boolean(state.tableGlobal.locked),
        dateView: state.tableGlobal.dateView!,
        sorting: state.sorting,
        grouping: state.grouping,
        groupingState: state.groupingState,
        globalFilter: state.globalFilter as unknown,
        columnFilters: state.columnFilters,
        filters: state.tableGlobal.filters,
      })}
    >
      {(resources) => <CalendarViewContentInner resources={resources} />}
    </table.Subscribe>
  );
}

function CalendarViewContentInner({
  resources,
}: {
  resources: DateViewResources;
}) {
  const resolution = useDateViewProperty(resources, initialization);
  if (resolution.status === "pending")
    return (
      <Table.Content data-testid="calendar-view-pending" aria-busy="true" />
    );
  if (resolution.status === "locked-empty")
    return (
      <Table.Content
        data-testid="calendar-view-locked-empty"
        className="py-8 text-sm text-secondary"
      >
        Add a Date property to display events in Calendar.
      </Table.Content>
    );
  return (
    <CalendarViewReady property={resolution.property} resources={resources} />
  );
}

function CalendarViewReady({
  property,
  resources,
}: {
  property: ColumnInfo;
  resources: DateViewResources;
}) {
  const { table } = useTableViewCtx();
  const { anchorDate, setAnchorDate } = useDateViewNavigation();
  const timeZone = getDatePropertyTimeZone(property);
  const actions = useCalendarActions({
    propertyId: property.id,
    timeZone,
    locked: resources.locked,
  });
  const rows = getCalendarRows(table.getSortedRowModel().rows);
  const titleId = resources.columnOrder.find(
    (id) => resources.columnsInfo[id]?.type === "title",
  );
  const events = rows.flatMap((row) => {
    const title = titleId
      ? String(row.original.properties[titleId]?.value ?? "")
      : "";
    const event = toCalendarEvent(
      row.original,
      property.id,
      title || "New page",
      timeZone,
    );
    return event ? [event] : [];
  });

  return (
    <Table.Content
      role="region"
      aria-label="Calendar"
      data-testid="calendar-view-ready"
      data-property-id={property.id}
      data-range={resources.dateView.range}
      className="min-w-0 max-md:px-4"
    >
      <CalendarProvider
        key={property.id}
        events={events}
        range={
          resources.dateView.range === "quarterly"
            ? "monthly"
            : resources.dateView.range
        }
        onRangeChange={table.setDateViewRange}
        anchorDate={anchorDate}
        onAnchorDateChange={setAnchorDate}
        timeZone={timeZone}
        weekStartsOn={table.options.weekStartsOn}
        readOnly={resources.locked}
        onCreate={actions.onCreate}
        onEventChange={actions.onEventChange}
        onEventClick={(event) => table.openRow(event.id)}
        className="h-[min(70vh,800px)] min-h-80"
      >
        <CalendarHeaderToolbar rangeDisabled={resources.locked} />
        <CalendarContent
          renderEvent={(props) => (
            <CalendarRowEvent
              {...props}
              timeZone={timeZone}
              locked={resources.locked}
            />
          )}
        />
      </CalendarProvider>
    </Table.Content>
  );
}

function CalendarRowEvent({
  event,
  segment,
  timeZone,
  locked,
}: CalendarEventRenderProps & { timeZone: string; locked: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const { isOpen } = useEditLog();
  return (
    <CalendarEvent.Root event={event} segment={segment}>
      {locked ? (
        <CalendarEvent.Item>
          <CalendarRowTitle event={event} timeZone={timeZone} />
        </CalendarEvent.Item>
      ) : (
        <ContextMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <ContextMenuTrigger ref={triggerRef} render={<CalendarEvent.Item />}>
            <CalendarRowTitle event={event} timeZone={timeZone} />
          </ContextMenuTrigger>
          <ContextMenuContent
            className="w-[265px]"
            finalFocus={() => (isOpen() ? false : triggerRef.current)}
          >
            <RowActionMenu
              rowId={event.id}
              onClose={() => setMenuOpen(false)}
              getReturnFocus={() => triggerRef.current}
            />
          </ContextMenuContent>
        </ContextMenu>
      )}
      <CalendarEvent.Resize edge="start" />
      <CalendarEvent.Resize edge="end" />
    </CalendarEvent.Root>
  );
}

function CalendarRowTitle({
  event,
  timeZone,
}: {
  event: CalendarEventData;
  timeZone: string;
}) {
  const { table } = useTableViewCtx();
  const row = table.getRow(event.id);
  const title = row
    .getAllCells()
    .find((cell) => cell.column.getInfo().type === "title");
  if (!title) return event.name;
  return (
    <span className="flex min-w-0 items-center gap-1 overflow-hidden">
      {!event.allDay && (
        <time
          className="shrink-0 text-secondary"
          dateTime={new Date(event.startAt).toISOString()}
        >
          {new Intl.DateTimeFormat("en", {
            timeZone,
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
          }).format(event.startAt)}
        </time>
      )}
      <Cell.Root cell={title} table={table} surface="calendar">
        <Cell.Content />
      </Cell.Root>
    </span>
  );
}
