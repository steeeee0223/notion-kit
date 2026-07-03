import type { DragOverEvent } from "@dnd-kit/react";
import { describe, expect, it } from "vitest";

import { getKanbanItemsAfterDrag, KanbanDnd } from "./kanban";

type TestItems = Record<string, string[]>;

function dragItemOver({
  sourceId,
  targetColumnId,
  targetId,
  targetType = KanbanDnd.Item,
}: {
  sourceId: string;
  targetColumnId?: string;
  targetId: string;
  targetType?: KanbanDnd;
}) {
  return {
    operation: {
      source: {
        id: sourceId,
        type: KanbanDnd.Item,
        manager: {
          dragOperation: {
            position: { current: { x: 0, y: 0 } },
          },
        },
      },
      target: {
        id: targetId,
        type: targetType,
        data: { columnId: targetColumnId },
      },
    },
  } as unknown as DragOverEvent;
}

describe("getKanbanItemsAfterDrag", () => {
  it("moves items over sortable items using dnd-kit move", () => {
    const items: TestItems = {
      todo: ["a", "b"],
      done: ["c"],
    };

    expect(
      getKanbanItemsAfterDrag(
        items,
        dragItemOver({ sourceId: "b", targetId: "c" }),
      ),
    ).toEqual({
      todo: ["a"],
      done: ["b", "c"],
    });
  });

  it("appends items to a column content target", () => {
    const items: TestItems = {
      todo: ["a", "b"],
      done: [],
    };

    expect(
      getKanbanItemsAfterDrag(
        items,
        dragItemOver({
          sourceId: "a",
          targetColumnId: "done",
          targetId: "content:done",
          targetType: KanbanDnd.ColumnContent,
        }),
      ),
    ).toEqual({
      todo: ["b"],
      done: ["a"],
    });
  });

  it("keeps items unchanged when the source is already last in the column content target", () => {
    const items: TestItems = {
      todo: ["a", "b"],
      done: [],
    };

    expect(
      getKanbanItemsAfterDrag(
        items,
        dragItemOver({
          sourceId: "b",
          targetColumnId: "todo",
          targetId: "content:todo",
          targetType: KanbanDnd.ColumnContent,
        }),
      ),
    ).toBe(items);
  });

  it("ignores column content targets that do not map to the controlled items", () => {
    const items: TestItems = {
      todo: ["a", "b"],
      done: [],
    };

    expect(
      getKanbanItemsAfterDrag(
        items,
        dragItemOver({
          sourceId: "a",
          targetColumnId: "missing",
          targetId: "content:missing",
          targetType: KanbanDnd.ColumnContent,
        }),
      ),
    ).toBe(items);
  });
});
