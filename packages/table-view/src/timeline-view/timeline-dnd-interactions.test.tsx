import {
  act,
  fireEvent,
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
} from "@notion-kit/table-hook";

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
      due: { id: "due-invalid", value: null },
    },
  },
];

type DataChange = ResourceChange<Row[], DataResourceAction>;

afterEach(() => vi.restoreAllMocks());

it("TimelineBarHandle_CrossThresholdAndReturn_CommitsExactMoveWithoutOpening", async () => {
  const onDataChange = vi.fn<(change: DataChange) => void>();
  const onViewChange = vi.fn();
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

  const track = document.querySelector<HTMLElement>(
    '[data-slot="timeline-track-row"][data-row-id="valid"]',
  )!;
  const handle = within(track).getByRole("button", {
    name: "Move Valid task",
  });
  await dragPointer(handle, [0, 20, 30, 5]);

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

  const timeline = document.querySelector<HTMLElement>(
    '[data-slot="timeline-view"]',
  )!;
  timeline.scrollLeft = 0;
  fireEvent.scroll(timeline);
  const resizers = document.querySelectorAll<HTMLElement>(
    '[data-slot="timeline-item-resizer"]',
  );
  expect(resizers).toHaveLength(2);

  await dragPointer(resizers[1]!, [225, 245, 250]);

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

  const sidebarRow = document.querySelector<HTMLElement>(
    '[data-slot="timeline-sidebar-row"][data-row-id="empty"]',
  )!;
  const handle = within(sidebarRow).getByRole("button", {
    name: "Move Empty task",
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
      const row = this.closest<HTMLElement>(
        '[data-slot="timeline-sidebar-row"]',
      );
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
