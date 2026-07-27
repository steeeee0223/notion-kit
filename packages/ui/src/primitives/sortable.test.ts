import type { DragEndEvent } from "@dnd-kit/react";
import { describe, expect, it } from "vitest";

import { getSortableItemsAfterDrag } from "./sortable";

function dragEndEvent({
  canceled = false,
  source = { id: "notes", initialIndex: 1, index: 1 },
  target = { id: "notes" },
  transform = { x: 10, y: 0 },
  activatorEvent = new KeyboardEvent("keydown", {
    code: "Space",
    key: " ",
  }),
}: {
  canceled?: boolean;
  source?: Record<string, unknown>;
  target?: Record<string, unknown> | null;
  transform?: { x: number; y: number };
  activatorEvent?: Event;
} = {}) {
  return {
    canceled,
    operation: {
      activatorEvent,
      source,
      target,
      transform,
    },
  } as unknown as DragEndEvent;
}

describe("getSortableItemsAfterDrag", () => {
  it("KeyboardDrag_CollapsedTarget_MovesOneItemInTransformDirection", () => {
    expect(
      getSortableItemsAfterDrag(["title", "notes", "score"], dragEndEvent()),
    ).toEqual(["title", "score", "notes"]);
  });

  it("KeyboardDrag_NegativeDirection_MovesOneItemBackward", () => {
    expect(
      getSortableItemsAfterDrag(
        ["title", "notes", "score"],
        dragEndEvent({ transform: { x: -10, y: 0 } }),
      ),
    ).toEqual(["notes", "title", "score"]);
  });

  it("KeyboardDrag_Boundary_KeepsItemAtBoundary", () => {
    const items = ["title", "notes", "score"];

    expect(
      getSortableItemsAfterDrag(
        items,
        dragEndEvent({
          source: { id: "title", initialIndex: 0, index: 0 },
          target: { id: "title" },
          transform: { x: -10, y: 0 },
        }),
      ),
    ).toBe(items);
  });

  it("KeyboardDrag_ObjectItems_MovesMatchingObject", () => {
    expect(
      getSortableItemsAfterDrag(
        [{ id: "title" }, { id: "notes" }, { id: "score" }],
        dragEndEvent(),
      ),
    ).toEqual([{ id: "title" }, { id: "score" }, { id: "notes" }]);
  });

  it("KeyboardDrag_ProjectedMultiStep_UsesDndKitProjection", () => {
    expect(
      getSortableItemsAfterDrag(
        ["title", "notes", "score", "status", "tags"],
        dragEndEvent({
          source: { id: "notes", initialIndex: 1, index: 3 },
          transform: { x: 10, y: 0 },
        }),
      ),
    ).toEqual(["title", "score", "status", "notes", "tags"]);
  });

  it("CanceledDrag_KeepsItemsUnchanged", () => {
    const items = ["title", "notes", "score"];

    expect(
      getSortableItemsAfterDrag(items, dragEndEvent({ canceled: true })),
    ).toBe(items);
  });

  it("PointerDrag_DelegatesToDndKitMove", () => {
    expect(
      getSortableItemsAfterDrag(
        ["title", "notes", "score"],
        dragEndEvent({
          activatorEvent: new MouseEvent("pointerdown"),
          target: { id: "score" },
          transform: { x: 10, y: 0 },
        }),
      ),
    ).toEqual(["title", "score", "notes"]);
  });
});
