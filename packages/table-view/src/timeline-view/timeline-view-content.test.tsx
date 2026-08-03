import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";

import type {
  ColumnInfo,
  DataResourceAction,
  ResourceChange,
  Row,
  TableViewState,
  ViewResourceAction,
} from "@notion-kit/table-hook";

import { TableView } from "@/table-contexts";

import { renderTableView } from "../__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "../__tests__/mock";

mockResizeObserver();

const properties: ColumnInfo[] = [
  {
    id: "title",
    name: "Name",
    type: "title",
    width: "220",
    config: { showIcon: false },
  },
  {
    id: "due",
    name: "Due",
    type: "date",
    width: "160",
    config: { dateFormat: "full", timeFormat: "24-hour", tz: "UTC" },
  },
];

const rows: Row[] = [
  {
    id: "valid",
    createdAt: 100,
    lastEditedAt: 100,
    properties: {
      title: { id: "title-valid", value: "Valid task" },
      due: { id: "due-valid", value: { start: 0, end: 86_400_000 } },
    },
  },
  {
    id: "empty",
    createdAt: 200,
    lastEditedAt: 200,
    properties: {
      title: { id: "title-empty", value: "Empty task" },
      due: { id: "due-empty", value: null },
    },
  },
  {
    id: "invalid",
    createdAt: 300,
    lastEditedAt: 300,
    properties: {
      title: { id: "title-invalid", value: "Invalid task" },
      due: { id: "due-invalid", value: { start: 20, end: 10 } },
    },
  },
];

function timelineView(overrides: Partial<TableViewState> = {}): TableViewState {
  return {
    layout: "timeline",
    rowView: "side",
    openedRowId: null,
    locked: false,
    timeline: { range: "monthly", datePropertyId: "due" },
    ...overrides,
  };
}

it("TimelineFlatRows_ValidEmptyAndInvalidDates_KeepSidebarAndTrackProjectionAligned", async () => {
  const { container } = render(
    <TableView data={rows} properties={properties} view={timelineView()} />,
  );

  expect(
    await screen.findByRole("complementary", { name: "Timeline table" }),
  ).toBeVisible();
  const sidebarIds = Array.from(
    container.querySelectorAll('[data-slot="timeline-sidebar-row"]'),
    (element) => element.getAttribute("data-row-id"),
  );
  const trackIds = Array.from(
    container.querySelectorAll('[data-slot="timeline-track-row"]'),
    (element) => element.getAttribute("data-row-id"),
  );

  expect(sidebarIds).toEqual(["valid", "empty", "invalid"]);
  expect(trackIds).toEqual(sidebarIds);
  expect(
    container.querySelectorAll('[data-slot="notion-timeline-item"]'),
  ).toHaveLength(1);
  expect(
    container.querySelectorAll('button[aria-label="Valid task"]'),
  ).toHaveLength(2);
});

it("TimelineSidebar_CollapseAndReopen_PreservesLocalVisibility", async () => {
  const tableView = renderTableView({
    data: rows,
    properties,
    view: timelineView(),
  });

  await tableView.user.click(
    await screen.findByRole("button", { name: "Hide table" }),
  );
  expect(
    screen.queryByRole("complementary", { name: "Timeline table" }),
  ).not.toBeInTheDocument();

  await tableView.user.click(
    screen.getByRole("button", { name: "Show table" }),
  );
  expect(
    await screen.findByRole("complementary", { name: "Timeline table" }),
  ).toBeVisible();
});

it("TimelineSidebar_TitleResize_UpdatesLiveWidthAndActiveStyle", async () => {
  const { container } = render(
    <TableView data={rows} properties={properties} view={timelineView()} />,
  );
  const timeline = container.querySelector<HTMLElement>(
    '[data-slot="timeline-view"]',
  )!;
  const resizeHandle = screen.getByRole("separator", { name: "Resize Name" });
  expect(timeline.style.getPropertyValue("--timeline-sidebar-width")).toBe(
    "200px",
  );

  fireEvent.mouseDown(resizeHandle, { clientX: 200 });
  fireEvent.mouseMove(document, { clientX: 260 });

  await waitFor(() => {
    expect(timeline.style.getPropertyValue("--timeline-sidebar-width")).toBe(
      "260px",
    );
    expect(resizeHandle).toHaveClass("bg-blue/80");
  });
  fireEvent.mouseUp(document, { clientX: 260 });
});

it("TimelineTitleAndBar_Click_OpenTheConfiguredRow", async () => {
  const onViewChange =
    vi.fn<
      (change: ResourceChange<TableViewState, ViewResourceAction>) => void
    >();
  const { container } = render(
    <TableView
      data={rows}
      properties={properties}
      view={timelineView()}
      onViewChange={onViewChange}
    />,
  );
  const sidebar = await screen.findByRole("complementary", {
    name: "Timeline table",
  });

  fireEvent.click(
    sidebar.querySelector<HTMLButtonElement>(
      'button[aria-label="Valid task"]',
    )!,
  );
  expect(onViewChange.mock.lastCall?.[0].action).toMatchObject({
    type: "view.opened_row.change",
    payload: { previousRowId: null, nextRowId: "valid" },
  });

  onViewChange.mockClear();
  const track = container.querySelector<HTMLElement>(
    '[data-slot="timeline-track-row"][data-row-id="valid"]',
  )!;
  fireEvent.click(within(track).getByRole("button", { name: "Valid task" }));
  expect(onViewChange.mock.lastCall?.[0].action).toMatchObject({
    type: "view.opened_row.change",
    payload: { previousRowId: "valid", nextRowId: "valid" },
  });
});

it("TimelineRangeSelect_Change_WritesExactViewResource", async () => {
  const onViewChange =
    vi.fn<
      (change: ResourceChange<TableViewState, ViewResourceAction>) => void
    >();
  const tableView = renderTableView({
    data: rows,
    properties,
    view: timelineView(),
    onViewChange,
  });

  await tableView.user.click(await screen.findByRole("combobox"));
  await tableView.user.click(
    await screen.findByRole("option", { name: "Day" }),
  );

  expect(onViewChange.mock.lastCall?.[0].action).toMatchObject({
    type: "view.timeline_range.change",
    payload: { previousRange: "monthly", nextRange: "daily" },
  });
});

it("TimelineSingleDate_Render_DoesNotMutateSourceCell", async () => {
  const onDataChange =
    vi.fn<(change: ResourceChange<Row[], DataResourceAction>) => void>();
  const singleDateRows: Row[] = [
    {
      ...rows[0]!,
      properties: {
        ...rows[0]!.properties,
        due: { id: "due-valid", value: { start: 0 } },
      },
    },
  ];
  const { container } = render(
    <TableView
      data={singleDateRows}
      properties={properties}
      view={timelineView()}
      onDataChange={onDataChange}
    />,
  );

  expect(
    await screen.findAllByRole("button", { name: "Valid task" }),
  ).not.toHaveLength(0);
  expect(
    container.querySelectorAll('[data-slot="timeline-item-resizer"]'),
  ).toHaveLength(2);
  expect(onDataChange).not.toHaveBeenCalled();
});

it("TimelineDatePropertySwitch_TwoPopulatedProperties_UpdatesBarCoordinates", async () => {
  const laterProperty: ColumnInfo = {
    id: "later",
    name: "Later",
    type: "date",
    width: "160",
    config: { dateFormat: "full", timeFormat: "24-hour", tz: "UTC" },
  };
  const populatedRows: Row[] = [
    {
      ...rows[0]!,
      properties: {
        ...rows[0]!.properties,
        due: {
          id: "due-valid",
          value: {
            start: new Date(2026, 0, 1).getTime(),
            end: new Date(2026, 1, 1).getTime(),
          },
        },
        later: {
          id: "later-valid",
          value: {
            start: new Date(2026, 2, 1).getTime(),
            end: new Date(2026, 3, 1).getTime(),
          },
        },
      },
    },
  ];
  const tableView = renderTableView({
    data: populatedRows,
    properties: [...properties, laterProperty],
    view: timelineView(),
  });
  const bar = document.querySelector('[data-slot="notion-timeline-item"]');
  expect(bar).toHaveStyle({ insetInlineStart: "100800px", width: "150px" });

  const settings = await tableView.openViewSettings();
  const layout = await settings.openLayout();
  await layout.selectTimelineProperty("Later");

  expect(bar).toHaveStyle({ insetInlineStart: "101100px", width: "150px" });
});

it("TimelineControlledDateCellReplacement_UpdatesBarCoordinates", async () => {
  const firstRows: Row[] = [
    {
      ...rows[0]!,
      properties: {
        ...rows[0]!.properties,
        due: {
          id: "due-valid",
          value: {
            start: new Date(2026, 0, 1).getTime(),
            end: new Date(2026, 1, 1).getTime(),
          },
        },
      },
    },
  ];
  const secondRows: Row[] = [
    {
      ...firstRows[0]!,
      properties: {
        ...firstRows[0]!.properties,
        due: {
          id: "due-valid-replacement",
          value: {
            start: new Date(2026, 4, 1).getTime(),
            end: new Date(2026, 5, 1).getTime(),
          },
        },
      },
    },
  ];
  const view = timelineView();
  const { rerender } = render(
    <TableView data={firstRows} properties={properties} view={view} />,
  );
  const bar = document.querySelector('[data-slot="notion-timeline-item"]');
  expect(bar).toHaveStyle({ insetInlineStart: "100800px", width: "150px" });

  rerender(<TableView data={secondRows} properties={properties} view={view} />);

  await waitFor(() =>
    expect(bar).toHaveStyle({
      insetInlineStart: "101400px",
      width: "150px",
    }),
  );
});

it("TimelineEmptyTrack_AddDate_WritesExactOneCalendarDayCellResource", async () => {
  const onDataChange =
    vi.fn<(change: ResourceChange<Row[], DataResourceAction>) => void>();
  render(
    <TableView
      data={rows}
      properties={properties}
      view={timelineView()}
      onDataChange={onDataChange}
    />,
  );

  const emptyTrack = document.querySelector<HTMLElement>(
    '[data-slot="timeline-add-feature-track"]',
  )!;
  fireEvent.mouseMove(emptyTrack, { clientX: 75 });
  fireEvent.click(
    await screen.findByRole("button", { name: "Add date to Empty task" }),
  );

  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  const action = onDataChange.mock.lastCall![0].action;
  expect(action.type).toBe("data.cell.update");
  if (action.type !== "data.cell.update") {
    throw new Error("Expected data.cell.update");
  }
  const nextValue = action.payload.nextValue as {
    start: number;
    end: number;
    endDate: boolean;
  };
  const expectedEnd = new Date(nextValue.start);
  expectedEnd.setDate(expectedEnd.getDate() + 1);
  expect(action.payload).toEqual({
    rowId: "empty",
    propertyId: "due",
    previousValue: null,
    nextValue: {
      start: nextValue.start,
      end: expectedEnd.getTime(),
      endDate: true,
    },
  });
});

it("TimelineLockedRows_RenderOpenableItemsWithoutWriteOrReorderControls", async () => {
  const onDataChange = vi.fn();
  const onViewChange =
    vi.fn<
      (change: ResourceChange<TableViewState, ViewResourceAction>) => void
    >();
  const { container } = render(
    <TableView
      data={rows}
      properties={properties}
      view={timelineView({ locked: true })}
      onDataChange={onDataChange}
      onViewChange={onViewChange}
    />,
  );

  expect(
    await screen.findAllByRole("button", { name: "Valid task" }),
  ).not.toHaveLength(0);
  expect(
    screen.queryByRole("button", { name: "Add date to Empty task" }),
  ).not.toBeInTheDocument();
  expect(
    container.querySelector('[data-slot="timeline-item-resizer"]'),
  ).not.toBeInTheDocument();
  expect(
    container.querySelector('[aria-roledescription="draggable"]'),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("separator", { name: "Resize Name" }),
  ).not.toBeInTheDocument();
  expect(onDataChange).not.toHaveBeenCalled();

  fireEvent.click(screen.getAllByRole("button", { name: "Valid task" })[0]!);
  expect(onViewChange.mock.lastCall?.[0].action).toMatchObject({
    type: "view.opened_row.change",
    payload: { previousRowId: null, nextRowId: "valid" },
  });
});

it("TimelineGrouping_ExpandCollapse_KeepsSidebarAndTrackProjectionAligned", async () => {
  const groupedProperties: ColumnInfo[] = [
    ...properties,
    {
      id: "done",
      name: "Done",
      type: "checkbox",
      width: "100",
      config: undefined,
    },
  ];
  const groupedRows = rows.map((row, index) => ({
    ...row,
    properties: {
      ...row.properties,
      done: { id: `done-${row.id}`, value: index !== 1 },
    },
  }));
  const tableView = renderTableView({
    data: groupedRows,
    properties: groupedProperties,
    view: timelineView(),
  });
  const settings = await tableView.openViewSettings();
  const grouping = await settings.openSelectGrouping();
  await grouping.select("Done");
  await tableView.clickOutside();

  const groups = await screen.findAllByRole("group", { name: /^Group / });
  expect(groups).toHaveLength(2);
  expect(
    document.querySelectorAll('[data-slot="timeline-group-spacer"]'),
  ).toHaveLength(2);
  expect(
    document.querySelector('[data-slot="timeline-group-spacer"]'),
  ).toHaveStyle({ height: "44px" });

  fireEvent.pointerDown(
    within(groups[0]!).getByRole("button", { name: "Open" }),
  );
  await waitFor(() => {
    const sidebarIds = Array.from(
      document.querySelectorAll(
        '[data-slot="timeline-sidebar-group"], [data-slot="timeline-sidebar-row"]',
      ),
      (element) => element.getAttribute("data-row-id"),
    );
    const trackIds = Array.from(
      document.querySelectorAll(
        '[data-slot="timeline-group-spacer"], [data-slot="timeline-track-row"]',
      ),
      (element) => element.getAttribute("data-row-id"),
    );
    expect(trackIds).toEqual(sidebarIds);
    expect(sidebarIds.length).toBeGreaterThan(2);
  });

  fireEvent.pointerDown(
    within(groups[0]!).getByRole("button", { name: "Close" }),
  );
  await waitFor(() => {
    expect(
      document.querySelectorAll('[data-slot="timeline-sidebar-row"]'),
    ).toHaveLength(0);
    expect(
      document.querySelectorAll('[data-slot="timeline-track-row"]'),
    ).toHaveLength(0);
  });
});
