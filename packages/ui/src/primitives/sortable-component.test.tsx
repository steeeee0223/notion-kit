import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Sortable } from "./sortable";

vi.mock("@dnd-kit/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@dnd-kit/react")>();

  return {
    ...actual,
    DragDropProvider: ({
      children,
      onDragStart,
    }: React.PropsWithChildren<{
      onDragStart?: (event: unknown) => void;
    }>) => (
      <>
        <button
          type="button"
          onClick={() =>
            onDragStart?.({ operation: { source: { id: "row1" } } })
          }
        >
          Start row drag
        </button>
        {children}
      </>
    ),
  };
});

vi.mock("@dnd-kit/react/sortable", () => ({
  useSortable: () => ({
    handleRef: () => {},
    isDragSource: false,
    isDragging: false,
    isDropping: false,
    isDropTarget: false,
    ref: () => {},
  }),
}));

describe("Sortable multi-drag state", () => {
  it("SelectedSource_StartsGroupDragForEverySelectedItem", () => {
    render(
      <Sortable.Root multiDrag={{ selectedIds: ["row1", "row2"] }}>
        <Sortable.Item
          id="row1"
          index={0}
          render={<div data-testid="row1" />}
        />
        <Sortable.Item
          id="row2"
          index={1}
          render={<div data-testid="row2" />}
        />
        <Sortable.Item
          id="row3"
          index={2}
          render={<div data-testid="row3" />}
        />
      </Sortable.Root>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Start row drag" }));

    expect(screen.getByTestId("row1")).toHaveAttribute("data-group-dragging");
    expect(screen.getByTestId("row2")).toHaveAttribute("data-group-dragging");
    expect(screen.getByTestId("row3")).not.toHaveAttribute(
      "data-group-dragging",
    );
  });
});
