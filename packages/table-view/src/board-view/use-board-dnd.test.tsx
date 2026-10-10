import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { KanbanDnd, type KanbanMove } from "@notion-kit/ui/kanban";

import { useBoardDnd } from "./use-board-dnd";

const state = vi.hoisted(() => ({
  locked: false,
  sorted: false,
  propertyId: "status",
  methodId: "value",
  allowed: true,
  rowsById: {} as Record<string, { parentId: string }>,
}));
const table = vi.hoisted(() => ({
  moveRow: vi.fn(),
  moveGroup: vi.fn(),
  resetSorting: vi.fn(),
  getTableGlobalState: () => ({ locked: state.locked }),
  getCanMoveRowToGroup: () => state.allowed,
  getRowModel: () => ({ rowsById: state.rowsById }),
  getSelectedGroupingMethod: () => ({ id: state.methodId }),
  atoms: {
    sorting: { get: () => (state.sorted ? [{ id: "title" }] : []) },
    grouping: { get: () => [state.propertyId] },
  },
}));
vi.mock("@/table-contexts", () => ({ useTableViewCtx: () => ({ table }) }));

const move: KanbanMove = {
  type: KanbanDnd.Item,
  id: "alpha",
  columnId: "status:Done",
  beforeId: "omega",
};

beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(state, {
    locked: false,
    sorted: false,
    propertyId: "status",
    methodId: "value",
    allowed: true,
    rowsById: {
      alpha: { parentId: "status:Active" },
      omega: { parentId: "status:Done" },
    },
  });
});

describe("useBoardDnd", () => {
  it("CompletedCardMove_SubmitsOneSemanticCommand", () => {
    const { result } = renderHook(() => useBoardDnd());
    act(() => result.current.onMove(move));
    expect(table.moveRow).toHaveBeenCalledExactlyOnceWith({
      rowId: "alpha",
      groupId: "status:Done",
      beforeRowId: "omega",
    });
  });

  it("CompletedColumnMove_UsesGroupCommand", () => {
    const { result } = renderHook(() => useBoardDnd());
    act(() =>
      result.current.onMove({
        type: KanbanDnd.Column,
        id: "status:Active",
        beforeId: null,
      }),
    );
    expect(table.moveGroup).toHaveBeenCalledExactlyOnceWith({
      groupId: "status:Active",
      beforeGroupId: null,
    });
    expect(table.moveRow).not.toHaveBeenCalled();
  });

  it("UnsupportedTransfer_DoesNotSubmit", () => {
    state.allowed = false;
    const { result } = renderHook(() => useBoardDnd());
    act(() => result.current.onMove(move));
    expect(table.moveRow).not.toHaveBeenCalled();
  });

  it("SortedMove_WaitsForConfirmationThenResetsSortAndMoves", () => {
    state.sorted = true;
    const { result } = renderHook(() => useBoardDnd());
    act(() => result.current.onMove(move));
    expect(table.moveRow).not.toHaveBeenCalled();
    expect(table.resetSorting).not.toHaveBeenCalled();
    act(() => result.current.confirmMove());
    expect(table.resetSorting).toHaveBeenCalledOnce();
    expect(table.moveRow).toHaveBeenCalledOnce();
    expect(table.resetSorting.mock.invocationCallOrder[0]).toBeLessThan(
      table.moveRow.mock.invocationCallOrder[0]!,
    );
    expect(result.current.pendingMove).toBeNull();
  });

  it("DismissedSortedMove_WritesNothing", () => {
    state.sorted = true;
    const { result } = renderHook(() => useBoardDnd());
    act(() => result.current.onMove(move));
    act(() => result.current.cancelMove());
    expect(result.current.pendingMove).toBeNull();
    expect(table.moveRow).not.toHaveBeenCalled();
    expect(table.resetSorting).not.toHaveBeenCalled();
  });

  it.each(["lock", "property", "method", "source", "anchor", "capability"])(
    "PendingMove_%sChange_ClearsWithoutWriting",
    (change) => {
      state.sorted = true;
      const { result, rerender } = renderHook(() => useBoardDnd());
      act(() => result.current.onMove(move));
      if (change === "lock") state.locked = true;
      if (change === "property") state.propertyId = "other";
      if (change === "method") state.methodId = "prefix";
      if (change === "source") delete state.rowsById.alpha;
      if (change === "anchor") delete state.rowsById.omega;
      if (change === "capability") state.allowed = false;
      rerender();
      expect(result.current.pendingMove).toBeNull();
      act(() => result.current.confirmMove());
      expect(table.moveRow).not.toHaveBeenCalled();
      expect(table.resetSorting).not.toHaveBeenCalled();
    },
  );
});
