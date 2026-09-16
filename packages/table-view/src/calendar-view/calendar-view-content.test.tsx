import { useEffect } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import type { Row } from "@notion-kit/table-hook";

import { CalendarViewObject } from "@/__tests__/component-objects/calendar-view";
import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "@/__tests__/mock";
import { TableView, useTableViewCtx } from "@/table-contexts";

mockResizeObserver();
const calendar = new CalendarViewObject();
const now = Date.parse("2026-09-16T12:00:00Z");
const properties = [
  { id: "title", name: "Name", type: "title", config: { showIcon: false } },
  {
    id: "due",
    name: "Due",
    type: "date",
    config: { dateFormat: "full", timeFormat: "24-hour", tz: "UTC" },
  },
  {
    id: "later",
    name: "Later",
    type: "date",
    config: { dateFormat: "full", timeFormat: "24-hour", tz: "UTC" },
  },
  { id: "done", name: "Done", type: "checkbox", config: undefined },
];
const data: Row[] = ["Keep A", "Keep B", "Other"].map((name, index) => ({
  id: `row-${index}`,
  createdAt: 0,
  lastEditedAt: 0,
  properties: {
    title: { id: `title-${index}`, value: name },
    due: { id: `due-${index}`, value: { start: now } },
    later: {
      id: `later-${index}`,
      value: { start: Date.parse("2026-12-16T00:00:00Z") },
    },
    done: { id: `done-${index}`, value: index === 2 },
  },
}));
const view = {
  layout: "calendar" as const,
  dateView: { datePropertyId: "due", range: "monthly" as const },
};
beforeEach(() => {
  vi.spyOn(Date, "now").mockReturnValue(now);
});
afterEach(() => {
  vi.restoreAllMocks();
});

function FilterAndCollapse() {
  const { table } = useTableViewCtx();
  useEffect(() => {
    table.setGrouping(["done"]);
    table.setExpanded({});
    table.setGlobalFilter("Keep");
    table.setSorting([{ id: "title", desc: true }]);
  }, [table]);
  return (
    <button
      onClick={() => table.setColumnFilters([{ id: "title", value: "Keep A" }])}
    >
      Filter title
    </button>
  );
}

it("CalendarProjection_FilteredCollapsedGroups_StillRendersSortedRealRows", async () => {
  renderTableView({
    data,
    properties,
    view,
    defaultColumn: { filterFn: "pluginTextIncludes" },
    children: <FilterAndCollapse />,
  });
  await calendar.findReady();
  expect(calendar.event("Keep A")).toBeVisible();
  expect(calendar.event("Keep B")).toBeVisible();
  expect(calendar.eventNames(/^Keep /)).toEqual(["Keep B", "Keep A"]);
  expect(calendar.queryEvent("Other")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("group", { name: /^Group / }),
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Filter title" }));
  expect(calendar.event("Keep A")).toBeVisible();
  expect(calendar.queryEvent("Keep B")).not.toBeInTheDocument();
});

it("CalendarEvent_LockedView_OpensConfiguredRowWithoutWritingData", async () => {
  const onDataChange = vi.fn();
  renderTableView({
    data,
    properties,
    view: { ...view, locked: true, rowView: "center" },
    onDataChange,
  });
  await calendar.findReady();
  calendar.create("September 16, 2026");
  calendar.open("Keep A");
  expect(await screen.findByRole("heading", { name: "Keep A" })).toBeVisible();
  expect(onDataChange).not.toHaveBeenCalled();
});

it("CalendarProperty_ExternalSelection_RendersChosenDates", async () => {
  const { rerender } = render(
    <TableView data={data} properties={properties} view={view} />,
  );
  await calendar.findReady();
  expect(calendar.event("Keep A")).toBeVisible();
  rerender(
    <TableView
      data={data}
      properties={properties}
      view={{
        ...view,
        dateView: { datePropertyId: "later", range: "monthly" },
      }}
    />,
  );
  await waitFor(() =>
    expect(calendar.queryEvent("Keep A")).not.toBeInTheDocument(),
  );
});

it("CalendarNavigation_TableRoundTrip_RetainsBrowsedMonth", async () => {
  const onViewChange = vi.fn();
  const tableView = renderTableView({ data, properties, view, onViewChange });
  await calendar.findReady();
  calendar.next();
  expect(calendar.root()).toHaveTextContent("October 2026");
  expect(onViewChange).not.toHaveBeenCalled();
  let layout = await (await tableView.openViewSettings()).openLayout();
  await layout.selectLayout("Table");
  await tableView.clickOutside();
  layout = await (await tableView.openViewSettings()).openLayout();
  await layout.selectLayout("Calendar");
  await tableView.clickOutside();
  expect(calendar.root()).toHaveTextContent("October 2026");
  expect(onViewChange).toHaveBeenCalledTimes(2);
  expect(onViewChange.mock.calls[0]?.[0]).toMatchObject({
    action: { type: "view.layout.change" },
  });
  expect(onViewChange.mock.calls[1]?.[0]).toMatchObject({
    action: { type: "view.layout.change" },
  });
});

it("CalendarCreate_FilteredOutNewRow_OpensAcceptedAuthoritativeRow", async () => {
  const onDataChange = vi.fn();
  const tableView = renderTableView({
    data,
    properties,
    view,
    onDataChange,
    children: <FilterAndCollapse />,
  });
  await calendar.findReady();
  calendar.create("September 16, 2026");
  await waitFor(() => expect(onDataChange).toHaveBeenCalledTimes(1));
  expect(await screen.findByRole("dialog")).toBeVisible();
  await tableView.user.click(screen.getByRole("button", { name: "Close row" }));
  expect(calendar.queryEvent("New page")).not.toBeInTheDocument();
});

it("CalendarRelativeFilter_MidnightBoundary_RemovesEventsOutsideTodayWithoutDataChanges", async () => {
  vi.restoreAllMocks();
  vi.useFakeTimers();
  try {
    vi.setSystemTime(Date.UTC(2026, 8, 16, 23, 59, 59));
    const onDataChange = vi.fn();
    const onViewChange = vi.fn();
    render(
      <TableView
        data={data.slice(0, 1)}
        properties={properties}
        view={{
          ...view,
          filters: {
            kind: "group",
            id: "relative-filter",
            logic: "and",
            children: [
              {
                kind: "rule",
                id: "today",
                propertyId: "due",
                operator: "relative-to-today",
                value: { amount: 0, unit: "day" },
              },
            ],
          },
        }}
        onDataChange={onDataChange}
        onViewChange={onViewChange}
      />,
    );
    expect(calendar.event("Keep A")).toBeVisible();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000);
    });
    expect(calendar.queryEvent("Keep A")).not.toBeInTheDocument();
    expect(onDataChange).not.toHaveBeenCalled();
    expect(onViewChange).not.toHaveBeenCalled();
  } finally {
    vi.useRealTimers();
  }
});
