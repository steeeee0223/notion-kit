import { describe, expect, it } from "vitest";

import { applyKanbanMove, KanbanDnd, type KanbanValue } from "./kanban";

const value: KanbanValue = {
  columnOrder: ["todo", "done", "empty"],
  items: { todo: ["a", "b", "c"], done: ["d", "e"], empty: [] },
};

describe("ApplyKanbanMove_Placement_ProjectsOnlyAffectedIds", () => {
  it("transfers a card before a destination card without changing unrelated IDs", () => {
    const next = applyKanbanMove(value, {
      type: KanbanDnd.Item,
      id: "b",
      columnId: "done",
      beforeId: "e",
    });
    expect(next.items).toEqual({
      todo: ["a", "c"],
      done: ["d", "b", "e"],
      empty: [],
    });
    expect(next.columnOrder).toBe(value.columnOrder);
    expect(next.items.empty).toBe(value.items.empty);
    expect(value.items.todo).toEqual(["a", "b", "c"]);
  });
  it("appends to an empty column", () => {
    expect(
      applyKanbanMove(value, {
        type: KanbanDnd.Item,
        id: "b",
        columnId: "empty",
        beforeId: null,
      }).items,
    ).toEqual({ todo: ["a", "c"], done: ["d", "e"], empty: ["b"] });
  });
  it("reorders within a column without duplicating the source", () => {
    expect(
      applyKanbanMove(value, {
        type: KanbanDnd.Item,
        id: "a",
        columnId: "todo",
        beforeId: "c",
      }).items.todo,
    ).toEqual(["b", "a", "c"]);
  });
  it("reorders columns without changing membership", () => {
    const next = applyKanbanMove(value, {
      type: KanbanDnd.Column,
      id: "todo",
      beforeId: null,
    });
    expect(next.columnOrder).toEqual(["done", "empty", "todo"]);
    expect(next.items).toBe(value.items);
  });
  it.each([
    {
      type: KanbanDnd.Item as const,
      id: "missing",
      columnId: "done",
      beforeId: null,
    },
    {
      type: KanbanDnd.Item as const,
      id: "a",
      columnId: "missing",
      beforeId: null,
    },
    { type: KanbanDnd.Item as const, id: "a", columnId: "done", beforeId: "c" },
    { type: KanbanDnd.Item as const, id: "a", columnId: "todo", beforeId: "b" },
    {
      type: KanbanDnd.Item as const,
      id: "c",
      columnId: "todo",
      beforeId: null,
    },
    { type: KanbanDnd.Item as const, id: "a", columnId: "todo", beforeId: "a" },
    { type: KanbanDnd.Column as const, id: "missing", beforeId: null },
    { type: KanbanDnd.Column as const, id: "todo", beforeId: "missing" },
    { type: KanbanDnd.Column as const, id: "todo", beforeId: "done" },
  ])(
    "retains the authoritative reference for invalid/no-op placement %j",
    (move) => {
      expect(applyKanbanMove(value, move)).toBe(value);
    },
  );
});
