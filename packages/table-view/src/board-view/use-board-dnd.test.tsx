import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { KanbanDnd } from "@notion-kit/ui/kanban";

import { useBoardDnd } from "./use-board-dnd";

const table = vi.hoisted(() => ({
  handleGroupedRowDragEnd: vi.fn(),
  handleKanbanRowDragOver: vi.fn(),
  handleRowDragEnd: vi.fn(),
}));

vi.mock("@/table-contexts", () => ({
  useTableViewCtx: () => ({ table }),
}));

function createDragEvent(type?: KanbanDnd) {
  return {
    canceled: false,
    operation: {
      canceled: false,
      source: type ? { id: "source", type } : null,
      target: { id: "target" },
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useBoardDnd", () => {
  it.each([undefined, KanbanDnd.Column])(
    "BoardDnd_DragOverFrom%s_DoesNotPreviewCardMovement",
    (sourceType) => {
      // Arrange
      const { result } = renderHook(() => useBoardDnd());
      const event = createDragEvent(sourceType);

      // Act
      result.current.onDragOver?.(event as never, {} as never);

      // Assert
      expect(table.handleKanbanRowDragOver).not.toHaveBeenCalled();
    },
  );

  it("BoardDnd_CardDragOver_ForwardsExactPreviewEvent", () => {
    // Arrange
    const { result } = renderHook(() => useBoardDnd());
    const event = createDragEvent(KanbanDnd.Item);

    // Act
    result.current.onDragOver?.(event as never, {} as never);

    // Assert
    expect(table.handleKanbanRowDragOver).toHaveBeenCalledExactlyOnceWith(
      event,
    );
  });

  it("BoardDnd_CardDragEnd_CommitsGroupingWithoutReorderingPreview", () => {
    // Arrange
    const { result } = renderHook(() => useBoardDnd());
    const event = createDragEvent(KanbanDnd.Item);

    // Act
    result.current.onDragEnd?.(event as never, {} as never);

    // Assert
    expect(table.handleRowDragEnd).toHaveBeenCalledExactlyOnceWith(event, {
      reorder: false,
    });
    expect(table.handleGroupedRowDragEnd).not.toHaveBeenCalled();
  });

  it("BoardDnd_ColumnDragEnd_ForwardsExactGroupMoveEvent", () => {
    // Arrange
    const { result } = renderHook(() => useBoardDnd());
    const event = createDragEvent(KanbanDnd.Column);

    // Act
    result.current.onDragEnd?.(event as never, {} as never);

    // Assert
    expect(table.handleGroupedRowDragEnd).toHaveBeenCalledExactlyOnceWith(
      event,
    );
    expect(table.handleRowDragEnd).not.toHaveBeenCalled();
  });

  it.each([undefined, KanbanDnd.ColumnContent])(
    "BoardDnd_DragEndFrom%s_DoesNotCommitMovement",
    (sourceType) => {
      // Arrange
      const { result } = renderHook(() => useBoardDnd());
      const event = createDragEvent(sourceType);

      // Act
      result.current.onDragEnd?.(event as never, {} as never);

      // Assert
      expect(table.handleRowDragEnd).not.toHaveBeenCalled();
      expect(table.handleGroupedRowDragEnd).not.toHaveBeenCalled();
    },
  );
});
