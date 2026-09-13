import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type {
  DataResourceAction,
  ResourceChange,
  Row,
} from "@notion-kit/table-hook";

import { renderTableView } from "./component-objects/render-table-view";
import type { TableViewObject } from "./component-objects/table-view";
import { mockData, mockResizeObserver } from "./mock";

const rowDragEndEvent = vi.hoisted(() => ({
  canceled: false,
  operation: {
    canceled: false,
    source: { id: "row1" },
    target: { id: "row2" },
  },
}));

vi.mock("@notion-kit/ui/primitives", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@notion-kit/ui/primitives")>();
  const React = await import("react");
  const OriginalRoot = actual.Sortable.Root;

  function SortableRoot(
    props: React.ComponentProps<typeof actual.Sortable.Root>,
  ) {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(OriginalRoot, props),
      (props.orientation === undefined || props.orientation === "vertical") &&
        props.onDragEnd
        ? React.createElement(
            "button",
            {
              type: "button",
              onClick: () =>
                props.onDragEnd?.(rowDragEndEvent as never, {} as never),
            },
            props.orientation === "vertical"
              ? "End timeline row drag"
              : "End row drag",
          )
        : null,
    );
  }

  return {
    ...actual,
    Sortable: { ...actual.Sortable, Root: SortableRoot },
  };
});

mockResizeObserver();

type DataChange = ResourceChange<Row[], DataResourceAction>;

async function useLayout(
  tableView: TableViewObject,
  layout: "table" | "list" | "timeline",
) {
  if (layout === "table") return;
  const settings = await tableView.openViewSettings();
  const layoutMenu = await settings.openLayout();
  await layoutMenu.selectLayout(layout === "list" ? "List" : "Timeline");
  await tableView.clickOutside();
}

describe.each(["table", "list", "timeline"] as const)(
  "%s sorted row drag",
  (layout) => {
    it("SortedRowDrag_ConfirmRemoveSorting_CommitsThePendingMove", async () => {
      // Arrange
      const onDataChange = vi.fn<(change: DataChange) => void>();
      const tableView = renderTableView({
        onDataChange,
        ...(layout === "timeline"
          ? {
              properties: [
                ...mockTimelineProperties,
                {
                  id: "due",
                  name: "Due",
                  type: "date" as const,
                  config: {
                    dateFormat: "full",
                    timeFormat: "24-hour",
                    tz: "UTC",
                  },
                },
              ],
              data: mockTimelineData,
            }
          : {}),
      });
      await useLayout(tableView, layout);
      const sort = await tableView.openSortMenu();
      await sort.addRule("Name");
      await tableView.clickOutside();

      // Act
      await tableView.user.click(
        layout === "timeline"
          ? screen.getByRole("button", { name: "End timeline row drag" })
          : screen.getAllByRole("button", { name: "End row drag" })[0]!,
      );

      // Assert
      expect(
        await screen.findByText("Would you like to remove sorting?"),
      ).toBeVisible();
      expect(onDataChange).not.toHaveBeenCalled();

      // Act
      await tableView.user.click(
        screen.getByRole("button", { name: "Remove" }),
      );

      // Assert
      await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
      const action = onDataChange.mock.lastCall?.[0].action;
      expect(typeof action?.id).toBe("string");
      expect(action).toEqual({
        id: action?.id,
        type: "data.row.move",
        payload: {
          rowId: "row1",
          previousPosition: 0,
          nextPosition: 1,
        },
      });
      await waitFor(() =>
        expect(
          screen.queryByText("Would you like to remove sorting?"),
        ).not.toBeInTheDocument(),
      );
    });

    it("UnsortedRowDrag_EndEvent_CommitsWithoutConfirmation", async () => {
      // Arrange
      const onDataChange = vi.fn<(change: DataChange) => void>();
      const tableView = renderTableView({
        onDataChange,
        ...(layout === "timeline"
          ? {
              properties: [
                ...mockTimelineProperties,
                {
                  id: "due",
                  name: "Due",
                  type: "date" as const,
                  config: {
                    dateFormat: "full",
                    timeFormat: "24-hour",
                    tz: "UTC",
                  },
                },
              ],
              data: mockTimelineData,
            }
          : {}),
      });
      await useLayout(tableView, layout);

      // Act
      await tableView.user.click(
        screen.getByRole("button", {
          name:
            layout === "timeline" ? "End timeline row drag" : "End row drag",
        }),
      );

      // Assert
      await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
      const action = onDataChange.mock.lastCall?.[0].action;
      expect(typeof action?.id).toBe("string");
      expect(action).toEqual({
        id: action?.id,
        type: "data.row.move",
        payload: {
          rowId: "row1",
          previousPosition: 0,
          nextPosition: 1,
        },
      });
      expect(
        screen.queryByText("Would you like to remove sorting?"),
      ).not.toBeInTheDocument();
    });
  },
);

const mockTimelineProperties = [
  {
    id: "col1",
    name: "Name",
    type: "title" as const,
    width: "200",
    config: { showIcon: false },
  },
  {
    id: "col2",
    name: "Done",
    type: "checkbox" as const,
    width: "100",
    config: undefined,
  },
];

const mockTimelineData = mockData.map((row) => ({
  ...row,
  properties: {
    ...row.properties,
    due: { id: `${row.id}-due`, value: { start: 1_735_689_600_000 } },
  },
}));
