import React from "react";
import type { DragDropManager, DragEndEvent } from "@dnd-kit/react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Sortable } from "./sortable";

const dnd = vi.hoisted(() => ({
  handleRef: vi.fn(),
  itemRef: vi.fn(),
  onDragEnd: undefined as
    | ((event: DragEndEvent, manager: DragDropManager) => void)
    | undefined,
}));

vi.mock("@dnd-kit/react", () => ({
  DragDropProvider: ({
    children,
    onDragEnd,
  }: React.PropsWithChildren<{
    onDragEnd?: typeof dnd.onDragEnd;
  }>) => {
    dnd.onDragEnd = onDragEnd;
    return children;
  },
  DragOverlay: ({ children }: React.PropsWithChildren) => (
    <div data-dnd-overlay="">{children}</div>
  ),
}));

vi.mock("@dnd-kit/react/sortable", () => ({
  useSortable: () => ({
    sortable: { id: "one" },
    isDragging: false,
    isDropping: false,
    isDragSource: false,
    isDropTarget: false,
    handleRef: dnd.handleRef,
    ref: dnd.itemRef,
    sourceRef: vi.fn(),
    targetRef: vi.fn(),
  }),
}));

function dragEndEvent(
  sourceId: string,
  targetId: string | null,
  canceled = false,
) {
  return {
    canceled,
    operation: {
      canceled,
      source: { id: sourceId },
      target: targetId === null ? null : { id: targetId },
    },
  } as DragEndEvent;
}

describe("Sortable", () => {
  beforeEach(() => {
    dnd.handleRef.mockClear();
    dnd.itemRef.mockClear();
    dnd.onDragEnd = undefined;
  });

  it("renders the default list, composed item, and accessible handle", () => {
    render(
      <Sortable.Root items={["one", "two"]}>
        <Sortable.List>
          <Sortable.Item id="one" index={0}>
            <Sortable.Handle aria-label="Move one" />
          </Sortable.Item>
          <Sortable.Item id="two" index={1} render={<article />} />
        </Sortable.List>
      </Sortable.Root>,
    );

    expect(screen.getByRole("button", { name: "Move one" })).toHaveAttribute(
      "data-slot",
      "sortable-handle",
    );
    expect(document.querySelector("[data-slot='sortable-list']")).toHaveClass(
      "flex-col",
    );
    expect(document.querySelector("article")).toHaveAttribute(
      "data-slot",
      "sortable-item",
    );
    expect(dnd.itemRef).toHaveBeenCalled();
    expect(dnd.handleRef).toHaveBeenCalled();
  });

  it("renders a horizontal list", () => {
    render(
      <Sortable.Root items={["one"]} orientation="horizontal">
        <Sortable.List>
          <Sortable.Item id="one" index={0} />
        </Sortable.List>
      </Sortable.Root>,
    );

    expect(document.querySelector("[data-slot='sortable-list']")).toHaveClass(
      "flex-row",
    );
  });

  it("emits the reordered ids after a valid drop", () => {
    const onItemsChange = vi.fn();
    render(
      <Sortable.Root items={["one", "two"]} onItemsChange={onItemsChange}>
        <Sortable.List>
          <Sortable.Item id="one" index={0} />
          <Sortable.Item id="two" index={1} />
        </Sortable.List>
      </Sortable.Root>,
    );
    const event = dragEndEvent("one", "two");

    dnd.onDragEnd?.(event, {} as DragDropManager);

    expect(onItemsChange).toHaveBeenCalledWith(["two", "one"], event);
  });

  it.each([
    ["a canceled drag", dragEndEvent("one", "two", true)],
    ["a missing target", dragEndEvent("one", null)],
    ["the same target", dragEndEvent("one", "one")],
    ["a stale source", dragEndEvent("missing", "two")],
    ["a stale target", dragEndEvent("one", "missing")],
  ])("does not emit items for %s", (_, event) => {
    const onItemsChange = vi.fn();
    render(
      <Sortable.Root items={["one", "two"]} onItemsChange={onItemsChange}>
        <Sortable.List>
          <Sortable.Item id="one" index={0} />
          <Sortable.Item id="two" index={1} />
        </Sortable.List>
      </Sortable.Root>,
    );

    dnd.onDragEnd?.(event, {} as DragDropManager);

    expect(onItemsChange).not.toHaveBeenCalled();
  });

  it("rejects a handle outside an item", () => {
    expect(() => render(<Sortable.Handle />)).toThrow(
      "Sortable.Handle must be used inside Sortable.Item",
    );
  });
});
