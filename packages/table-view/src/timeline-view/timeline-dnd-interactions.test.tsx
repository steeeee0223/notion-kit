import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

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
import { TimelineViewObject } from "../__tests__/component-objects/timeline-view";
import { mockResizeObserver } from "../__tests__/mock";

mockResizeObserver();
const timeline = new TimelineViewObject();

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
      due: { id: "due-invalid", value: null },
    },
  },
];

type DataChange = ResourceChange<Row[], DataResourceAction>;
type ViewChange = ResourceChange<TableViewState, ViewResourceAction>;

afterEach(() => vi.restoreAllMocks());

it("TimelineCardSurface_CrossThresholdAndReturn_CommitsExactMoveWithoutOpening", async () => {
  const onDataChange = vi.fn<(change: DataChange) => void>();
  const onViewChange = vi.fn<(change: ViewChange) => void>();
  renderTableView({
    data: rows,
    properties,
    view: {
      layout: "timeline",
      rowView: "side",
      openedRowId: null,
      timeline: { range: "monthly", datePropertyId: "due" },
    },
    onDataChange,
    onViewChange,
  });

  const card = timeline.itemCard("valid");
  await dragPointer(card, [0, 20, 30, 5]);

  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  const action = onDataChange.mock.lastCall?.[0].action;
  expect(typeof action?.id).toBe("string");
  expect(action).toEqual({
    id: action?.id,
    type: "data.cell.update",
    payload: {
      rowId: "valid",
      propertyId: "due",
      previousValue: { start: 0, end: 86_400_000 },
      nextValue: {
        start: -259_200_000,
        end: -172_800_000,
        endDate: true,
      },
    },
  });
  expect(onViewChange).not.toHaveBeenCalled();
});

it("TimelineCardSurface_ActivatedDragThenReset_NextClickOpensExactRow", async () => {
  const onDataChange = vi.fn<(change: DataChange) => void>();
  const onViewChange = vi.fn<(change: ViewChange) => void>();
  render(
    <TableView
      data={rows}
      properties={properties}
      view={{
        layout: "timeline",
        rowView: "side",
        openedRowId: null,
        timeline: { range: "monthly", datePropertyId: "due" },
      }}
      onDataChange={onDataChange}
      onViewChange={onViewChange}
    />,
  );

  const card = getTimelineCard("valid");
  await dragPointer(card, [0, 20, 30, 5]);

  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  expect(onViewChange).not.toHaveBeenCalled();

  await waitForDragClickReset();
  fireEvent.click(getTimelineCard("valid"));

  await waitFor(() => expect(onViewChange).toHaveBeenCalledOnce());
  expect(onViewChange.mock.lastCall?.[0].action).toMatchObject({
    type: "view.opened_row.change",
    payload: { previousRowId: null, nextRowId: "valid" },
  });
});

it("TimelineCardSurface_PointerCancel_DoesNotCommitAndNextClickOpensExactRow", async () => {
  const onDataChange = vi.fn<(change: DataChange) => void>();
  const onViewChange = vi.fn<(change: ViewChange) => void>();
  renderTableView({
    data: rows,
    properties,
    view: {
      layout: "timeline",
      rowView: "side",
      openedRowId: null,
      timeline: { range: "monthly", datePropertyId: "due" },
    },
    onDataChange,
    onViewChange,
  });

  const card = getTimelineCard("valid");
  await cancelPointerDrag(card, [0, 20, 30]);

  expect(onDataChange).not.toHaveBeenCalled();
  expect(onViewChange).not.toHaveBeenCalled();

  await waitForDragClickReset();
  fireEvent.click(getTimelineCard("valid"));

  await waitFor(() => expect(onViewChange).toHaveBeenCalledOnce());
  expect(onViewChange.mock.lastCall?.[0].action).toMatchObject({
    type: "view.opened_row.change",
    payload: { previousRowId: null, nextRowId: "valid" },
  });
});

it("TimelineCardSurface_RejectedControlledMove_NextDragUsesAuthoritativeRange", async () => {
  const onDataChange = vi.fn<(change: DataChange) => void>();
  const view = {
    layout: "timeline" as const,
    rowView: "side" as const,
    openedRowId: null,
    timeline: { range: "monthly" as const, datePropertyId: "due" },
  };
  const { rerender } = render(
    <TableView
      data={rows}
      properties={properties}
      view={view}
      onDataChange={onDataChange}
    />,
  );
  const card = timeline.itemCard("valid");

  await dragPointer(card, [0, 20, 30, 5]);

  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  rerender(
    <TableView
      data={[...rows]}
      properties={properties}
      view={view}
      onDataChange={onDataChange}
    />,
  );
  onDataChange.mockClear();

  await dragPointer(getTimelineCard("valid"), [0, 20, 30, 5]);

  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  expect(onDataChange.mock.lastCall?.[0].action).toMatchObject({
    type: "data.cell.update",
    payload: {
      rowId: "valid",
      propertyId: "due",
      previousValue: { start: 0, end: 86_400_000 },
      nextValue: {
        start: -259_200_000,
        end: -172_800_000,
        endDate: true,
      },
    },
  });
});

it("TimelineLockedCard_PointerGestureDoesNotWriteAndNextClickOpensExactRow", async () => {
  const onDataChange = vi.fn<(change: DataChange) => void>();
  const onViewChange = vi.fn<(change: ViewChange) => void>();
  renderTableView({
    data: rows,
    properties,
    view: {
      layout: "timeline",
      rowView: "side",
      openedRowId: null,
      locked: true,
      timeline: { range: "monthly", datePropertyId: "due" },
    },
    onDataChange,
    onViewChange,
  });

  const lockedCard = getTimelineCard("valid");
  await dragPointer(lockedCard, [0, 20, 30, 5]);

  expect(onDataChange).not.toHaveBeenCalled();
  expect(onViewChange).not.toHaveBeenCalled();

  fireEvent.click(getTimelineCard("valid"));

  await waitFor(() => expect(onViewChange).toHaveBeenCalledOnce());
  expect(onViewChange.mock.lastCall?.[0].action).toMatchObject({
    type: "view.opened_row.change",
    payload: { previousRowId: null, nextRowId: "valid" },
  });
});

it("TimelineCardSurface_EqualEpochRange_CommitsExactMove", async () => {
  const onDataChange = vi.fn<(change: DataChange) => void>();
  const equalEpochRows: Row[] = [
    {
      ...rows[0]!,
      properties: {
        ...rows[0]!.properties,
        due: { id: "due-valid", value: { start: 0, end: 0 } },
      },
    },
  ];
  renderTableView({
    data: equalEpochRows,
    properties,
    view: {
      layout: "timeline",
      timeline: { range: "monthly", datePropertyId: "due" },
    },
    onDataChange,
  });
  const card = timeline.itemCard("valid");

  await dragPointer(card, [0, 20, 30, 5]);

  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  expect(onDataChange.mock.lastCall?.[0].action).toMatchObject({
    type: "data.cell.update",
    payload: {
      rowId: "valid",
      propertyId: "due",
      previousValue: { start: 0, end: 0 },
      nextValue: {
        start: -259_200_000,
        end: -259_200_000,
        endDate: true,
      },
    },
  });
});

it("TimelineLeftResizer_EqualEpochRange_DoesNotCommitAnUnchangedRange", async () => {
  const onDataChange = vi.fn<(change: DataChange) => void>();
  const equalEpochRows: Row[] = [
    {
      ...rows[0]!,
      properties: {
        ...rows[0]!.properties,
        due: { id: "due-valid", value: { start: 0, end: 0 } },
      },
    },
  ];
  renderTableView({
    data: equalEpochRows,
    properties,
    view: {
      layout: "timeline",
      timeline: { range: "monthly", datePropertyId: "due" },
    },
    onDataChange,
  });
  const leftResizer = timeline.resizer("valid", "start");

  await dragPointer(leftResizer, [25, 0]);

  await waitFor(() => expect(onDataChange).not.toHaveBeenCalled());
});

it("TimelineRightResizer_PointerDrag_CommitsExactCellEnvelope", async () => {
  const onDataChange = vi.fn<(change: DataChange) => void>();
  renderTableView({
    data: rows,
    properties,
    view: {
      layout: "timeline",
      timeline: { range: "monthly", datePropertyId: "due" },
    },
    onDataChange,
  });

  const timelineRoot = timeline.root();
  timelineRoot.scrollLeft = 0;
  fireEvent.scroll(timelineRoot);
  const resizers = timeline.resizers("valid");
  expect(resizers).toHaveLength(2);

  await dragPointer(resizers[1]!, [25, 45, 50]);

  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  const januaryEleventhAtLocalMidnight = new Date(1970, 0, 11).getTime();
  const action = onDataChange.mock.lastCall?.[0].action;
  expect(typeof action?.id).toBe("string");
  expect(action).toEqual({
    id: action?.id,
    type: "data.cell.update",
    payload: {
      rowId: "valid",
      propertyId: "due",
      previousValue: { start: 0, end: 86_400_000 },
      nextValue: {
        start: 0,
        end: januaryEleventhAtLocalMidnight,
        endDate: true,
      },
    },
  });
});

it("TimelineSidebarHandle_SortedPointerDrag_ConfirmsThenCommitsExactMove", async () => {
  mockTimelineRowRects();
  const onDataChange = vi.fn<(change: DataChange) => void>();
  const tableView = renderTableView({
    data: rows,
    properties,
    view: {
      layout: "timeline",
      timeline: { range: "monthly", datePropertyId: "due" },
    },
    onDataChange,
  });
  const sort = await tableView.openSortMenu();
  await sort.addRule("Name");
  await tableView.clickOutside();

  const sidebarRow = timeline.sidebarRow("empty");
  const handle = within(sidebarRow).getByRole("button", {
    name: "Row actions",
  });
  await dragPointer(handle, [18, 30, 60, 90], "vertical");

  expect(
    await screen.findByText("Would you like to remove sorting?"),
  ).toBeVisible();
  expect(onDataChange).not.toHaveBeenCalled();

  await tableView.user.click(screen.getByRole("button", { name: "Remove" }));
  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  const action = onDataChange.mock.lastCall?.[0].action;
  expect(typeof action?.id).toBe("string");
  expect(action).toEqual({
    id: action?.id,
    type: "data.row.move",
    payload: {
      rowId: "empty",
      previousPosition: 1,
      nextPosition: 0,
    },
  });
});

async function dragPointer(
  handle: Element,
  positions: number[],
  axis: "horizontal" | "vertical" = "horizontal",
) {
  const [start, ...moves] = positions;
  const coordinates = (position: number) =>
    axis === "horizontal"
      ? { clientX: position, clientY: 18 }
      : { clientX: 18, clientY: position };

  fireEvent.mouseMove(document, coordinates(start!));
  fireEvent.pointerDown(handle, {
    ...coordinates(start!),
    button: 0,
    buttons: 1,
    isPrimary: true,
    pointerId: 1,
    pointerType: "mouse",
  });
  for (const position of moves) {
    fireEvent.mouseMove(document, coordinates(position));
    fireEvent.pointerMove(document, {
      ...coordinates(position),
      buttons: 1,
      isPrimary: true,
      pointerId: 1,
      pointerType: "mouse",
    });
    await flushAnimationFrame();
  }
  const end = positions.at(-1)!;
  fireEvent.pointerUp(document, {
    ...coordinates(end),
    button: 0,
    buttons: 0,
    isPrimary: true,
    pointerId: 1,
    pointerType: "mouse",
  });
  await flushAnimationFrame();
}

async function cancelPointerDrag(handle: Element, positions: number[]) {
  const [start, ...moves] = positions;
  const coordinates = (position: number) => ({
    clientX: position,
    clientY: 18,
  });

  fireEvent.mouseMove(document, coordinates(start!));
  fireEvent.pointerDown(handle, {
    ...coordinates(start!),
    button: 0,
    buttons: 1,
    isPrimary: true,
    pointerId: 1,
    pointerType: "mouse",
  });
  for (const position of moves) {
    fireEvent.mouseMove(document, coordinates(position));
    fireEvent.pointerMove(document, {
      ...coordinates(position),
      buttons: 1,
      isPrimary: true,
      pointerId: 1,
      pointerType: "mouse",
    });
    await flushAnimationFrame();
  }
  const end = positions.at(-1)!;
  fireEvent.pointerCancel(document, {
    ...coordinates(end),
    button: 0,
    buttons: 0,
    isPrimary: true,
    pointerId: 1,
    pointerType: "mouse",
  });
  await flushAnimationFrame();
}

function getTimelineCard(rowId: string) {
  return timeline.itemCard(rowId);
}

async function waitForDragClickReset() {
  await act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));
}

async function flushAnimationFrame() {
  await act(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      }),
  );
}

function mockTimelineRowRects() {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function (this: HTMLElement) {
      if (this.dataset.slot === "sortable-list") {
        return {
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          right: 220,
          bottom: 108,
          width: 220,
          height: 108,
          toJSON: () => ({}),
        };
      }
      const row = timeline.closestSidebarRow(this);
      const positions: Record<string, number> = {
        empty: 0,
        invalid: 36,
        valid: 72,
      };
      const top = positions[row?.dataset.rowId ?? ""];
      if (top === undefined) {
        return {
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          right: 1_000,
          bottom: 1_000,
          width: 1_000,
          height: 1_000,
          toJSON: () => ({}),
        };
      }
      return {
        x: 0,
        y: top,
        top,
        left: 0,
        right: 220,
        bottom: top + 36,
        width: 220,
        height: 36,
        toJSON: () => ({}),
      };
    },
  );
}
