import type { DragEndEvent } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { TableInstance } from "@notion-kit/table-hook";

import { getRowMoveIntent } from "./row-dnd";

function groupedTable() {
  const rows = ["a", "b", "c", "d", "e"].map((id) => ({ id }));
  const group = {
    id: "group",
    subRows: rows.slice(2),
    getIsGrouped: () => true,
  };
  const otherGroup = {
    id: "other",
    subRows: rows.slice(0, 2),
    getIsGrouped: () => true,
  };
  return {
    options: { data: rows },
    atoms: { tableGlobal: { get: () => ({ locked: false }) } },
    getRowModel: () => ({
      rowsById: {
        ...Object.fromEntries(rows.map((row) => [row.id, row])),
        group,
        other: otherGroup,
      },
    }),
  } as unknown as TableInstance;
}

function groupedDrag({
  rowId = "c",
  initialIndex = 0,
  index = initialIndex,
  group = "group",
  targetId = rowId,
  keyboard = false,
  y = 0,
}: {
  rowId?: string;
  initialIndex?: number;
  index?: number;
  group?: string;
  targetId?: string;
  keyboard?: boolean;
  y?: number;
} = {}) {
  const { result } = renderHook(() =>
    useSortable({ id: rowId, index: initialIndex, group: "group" }),
  );
  const source = result.current.sortable.draggable;
  Object.defineProperties(source, {
    index: { value: index },
    initialIndex: { value: initialIndex },
    group: { value: group },
    initialGroup: { value: "group" },
  });
  return {
    canceled: false,
    operation: {
      source,
      target: { id: targetId },
      transform: { x: 0, y },
      activatorEvent: keyboard
        ? new KeyboardEvent("keydown", { key: " ", code: "Space" })
        : new MouseEvent("pointerdown"),
    },
  } as unknown as DragEndEvent;
}

describe("getRowMoveIntent grouped shared views", () => {
  it("StationaryDrag_InterleavedRows_DoesNotMoveFirstGroupRow", () => {
    expect(getRowMoveIntent(groupedTable(), groupedDrag())).toBeNull();
  });

  it("KeyboardSelfTarget_LocalIndex_MovesDownWithinItsGroup", () => {
    expect(
      getRowMoveIntent(groupedTable(), groupedDrag({ keyboard: true, y: 20 })),
    ).toEqual({ rowId: "c", groupId: "group", beforeRowId: "e" });
  });

  it("KeyboardSelfTarget_LocalIndex_MovesUpWithinItsGroup", () => {
    expect(
      getRowMoveIntent(
        groupedTable(),
        groupedDrag({ rowId: "d", initialIndex: 1, keyboard: true, y: -20 }),
      ),
    ).toEqual({ rowId: "d", groupId: "group", beforeRowId: "c" });
  });

  it("PointerTarget_UnchangedIndex_UsesTargetSibling", () => {
    expect(
      getRowMoveIntent(groupedTable(), groupedDrag({ targetId: "e" })),
    ).toEqual({ rowId: "c", groupId: "group", beforeRowId: null });
  });

  it("ProjectedIndex_SelfTarget_UsesNativeLocalPlacement", () => {
    expect(getRowMoveIntent(groupedTable(), groupedDrag({ index: 1 }))).toEqual(
      {
        rowId: "c",
        groupId: "group",
        beforeRowId: "e",
      },
    );
  });

  it("ProjectedGroup_UsesDestinationSiblings", () => {
    expect(
      getRowMoveIntent(
        groupedTable(),
        groupedDrag({ group: "other", index: 1 }),
      ),
    ).toEqual({ rowId: "c", groupId: "other", beforeRowId: "b" });
  });

  it("KeyboardSelfTarget_FirstSibling_DoesNotCrossGroupBoundary", () => {
    expect(
      getRowMoveIntent(groupedTable(), groupedDrag({ keyboard: true, y: -20 })),
    ).toBeNull();
  });
});
