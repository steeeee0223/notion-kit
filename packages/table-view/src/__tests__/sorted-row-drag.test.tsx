import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type {
  DataResourceAction,
  ResourceChange,
  Row,
} from "@notion-kit/table-hook";

import { renderTableView } from "./component-objects/render-table-view";
import type { TableViewObject } from "./component-objects/table-view";
import { mockResizeObserver } from "./mock";

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
      props.orientation === undefined && props.onDragEnd
        ? React.createElement(
            "button",
            {
              type: "button",
              onClick: () =>
                props.onDragEnd?.(rowDragEndEvent as never, {} as never),
            },
            "End row drag",
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

async function useLayout(tableView: TableViewObject, layout: "table" | "list") {
  if (layout === "table") return;
  const settings = await tableView.openViewSettings();
  const layoutMenu = await settings.openLayout();
  await layoutMenu.selectLayout("List");
  await tableView.clickOutside();
}

describe.each(["table", "list"] as const)("%s sorted row drag", (layout) => {
  it("SortedRowDrag_ConfirmRemoveSorting_CommitsThePendingMove", async () => {
    // Arrange
    const onDataChange = vi.fn<(change: DataChange) => void>();
    const tableView = renderTableView({ onDataChange });
    await useLayout(tableView, layout);
    const sort = await tableView.openSortMenu();
    await sort.addRule("Name");
    await tableView.clickOutside();

    // Act
    await tableView.user.click(
      screen.getByRole("button", { name: "End row drag" }),
    );

    // Assert
    expect(
      await screen.findByText("Would you like to remove sorting?"),
    ).toBeVisible();
    expect(onDataChange).not.toHaveBeenCalled();

    // Act
    await tableView.user.click(screen.getByRole("button", { name: "Remove" }));

    // Assert
    await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
    expect(onDataChange.mock.lastCall?.[0].action).toEqual({
      id: expect.any(String),
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

  it("UnsortedRowDrag_EndEvent_CommitsWithoutConfirmation", async () => {
    // Arrange
    const onDataChange = vi.fn<(change: DataChange) => void>();
    const tableView = renderTableView({ onDataChange });
    await useLayout(tableView, layout);

    // Act
    await tableView.user.click(
      screen.getByRole("button", { name: "End row drag" }),
    );

    // Assert
    await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
    expect(onDataChange.mock.lastCall?.[0].action).toEqual({
      id: expect.any(String),
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
});
