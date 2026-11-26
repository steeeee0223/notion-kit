import type { ReactNode } from "react";
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/react";
import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Kanban, KanbanDnd, type KanbanMove, type KanbanValue } from "./kanban";

const handlers = vi.hoisted(() => ({
  onDragStart: vi.fn<(event: DragStartEvent) => void>(),
  onDragOver: vi.fn<(event: DragOverEvent) => void>(),
  onDragEnd: vi.fn<(event: DragEndEvent) => void>(),
}));
vi.mock("@/primitives", () => ({
  Sortable: {
    Root: ({
      children,
      ...props
    }: {
      onDragStart: (event: DragStartEvent) => void;
      onDragOver: (event: DragOverEvent) => void;
      onDragEnd: (event: DragEndEvent) => void;
      children: ReactNode;
    }) => {
      Object.assign(handlers, props);
      return children;
    },
    List: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Overlay: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  },
}));

const value: KanbanValue = {
  columnOrder: ["todo", "done"],
  items: { todo: ["a", "b"], done: [] },
};
function event(target: object | null = null) {
  return {
    canceled: false,
    operation: {
      source: { id: "a", type: KanbanDnd.Item },
      target,
      position: { current: { x: 0, y: 0 } },
      activatorEvent: new MouseEvent("pointerdown"),
    },
  } as unknown as DragEndEvent & DragOverEvent & DragStartEvent;
}
function Board({
  onMove,
  current = value,
  contextKey = "default",
  disabled = false,
  canMove,
}: {
  onMove: (move: KanbanMove) => void;
  current?: KanbanValue;
  contextKey?: string;
  disabled?: boolean;
  canMove?: (move: KanbanMove) => boolean;
}) {
  return (
    <Kanban.Root
      value={current}
      onMove={onMove}
      contextKey={contextKey}
      disabled={disabled}
      canMove={canMove}
      renderOverlay={({ id }) => <span>Overlay {id}</span>}
    >
      {(projected) => (
        <output data-testid="membership">
          {JSON.stringify(projected.items)}
        </output>
      )}
    </Kanban.Root>
  );
}
function startAndPreview() {
  act(() => handlers.onDragStart(event()));
  act(() =>
    handlers.onDragOver(
      event({
        id: "content:done",
        type: KanbanDnd.ColumnContent,
        data: { columnId: "done" },
      }),
    ),
  );
}
beforeEach(() => vi.clearAllMocks());
describe("KanbanSession_Gesture_UsesAuthoritativeCompletion", () => {
  it("previews without committing and commits once on a valid final target", () => {
    const onMove = vi.fn();
    render(<Board onMove={onMove} />);
    startAndPreview();
    expect(screen.getByTestId("membership")).toHaveTextContent(
      JSON.stringify({ todo: ["b"], done: ["a"] }),
    );
    expect(onMove).not.toHaveBeenCalled();
    act(() =>
      handlers.onDragEnd(
        event({
          id: "content:done",
          type: KanbanDnd.ColumnContent,
          data: { columnId: "done" },
        }),
      ),
    );
    expect(onMove).toHaveBeenCalledExactlyOnceWith({
      type: KanbanDnd.Item,
      id: "a",
      columnId: "done",
      beforeId: null,
    });
    expect(screen.getByTestId("membership")).toHaveTextContent(
      JSON.stringify(value.items),
    );
    expect(screen.queryByText("Overlay a")).not.toBeInTheDocument();
  });
  it.each(["outside", "cancel"])(
    "clears preview with no write on %s after a valid hover",
    (ending) => {
      const onMove = vi.fn();
      render(<Board onMove={onMove} />);
      startAndPreview();
      expect(screen.getByText("Overlay a")).toBeInTheDocument();
      act(() =>
        handlers.onDragEnd({ ...event(), canceled: ending === "cancel" }),
      );
      expect(onMove).not.toHaveBeenCalled();
      expect(screen.getByTestId("membership")).toHaveTextContent(
        JSON.stringify(value.items),
      );
      expect(screen.queryByText("Overlay a")).not.toBeInTheDocument();
    },
  );
  it("ignores a collision callback queued after cancellation", () => {
    const onMove = vi.fn();
    render(<Board onMove={onMove} />);
    startAndPreview();

    act(() => {
      handlers.onDragEnd({ ...event(), canceled: true });
      handlers.onDragOver(event());
    });

    expect(screen.queryByText("Overlay a")).not.toBeInTheDocument();
    expect(onMove).not.toHaveBeenCalled();
  });
  it("invalidates a session permanently when context changes", () => {
    const onMove = vi.fn();
    const { rerender } = render(<Board onMove={onMove} />);
    startAndPreview();
    rerender(<Board onMove={onMove} contextKey="changed" />);
    rerender(<Board onMove={onMove} />);
    act(() =>
      handlers.onDragEnd(
        event({
          id: "content:done",
          type: KanbanDnd.ColumnContent,
          data: { columnId: "done" },
        }),
      ),
    );
    expect(onMove).not.toHaveBeenCalled();
    expect(screen.queryByText("Overlay a")).not.toBeInTheDocument();
  });
  it("invalidates membership changes but permits equivalent authoritative ID inputs", () => {
    const onMove = vi.fn();
    const { rerender } = render(<Board onMove={onMove} />);
    startAndPreview();
    rerender(
      <Board
        onMove={onMove}
        current={{ ...value, items: { todo: ["a", "b"], done: [] } }}
      />,
    );
    expect(screen.getByText("Overlay a")).toBeInTheDocument();
    rerender(
      <Board
        onMove={onMove}
        current={{ ...value, items: { todo: ["a"], done: [] } }}
      />,
    );
    expect(screen.queryByText("Overlay a")).not.toBeInTheDocument();
    act(() =>
      handlers.onDragEnd(
        event({
          id: "content:done",
          type: KanbanDnd.ColumnContent,
          data: { columnId: "done" },
        }),
      ),
    );
    expect(onMove).not.toHaveBeenCalled();
  });
  it("blocks a destination rejected by current capability and does not retain an earlier preview", () => {
    const onMove = vi.fn();
    const { rerender } = render(<Board onMove={onMove} />);
    startAndPreview();
    rerender(<Board onMove={onMove} canMove={() => false} />);
    act(() =>
      handlers.onDragEnd(
        event({
          id: "content:done",
          type: KanbanDnd.ColumnContent,
          data: { columnId: "done" },
        }),
      ),
    );
    expect(onMove).not.toHaveBeenCalled();
    expect(screen.getByTestId("membership")).toHaveTextContent(
      JSON.stringify(value.items),
    );
  });
  it("invalidates when disabled even without changing caller context", () => {
    const onMove = vi.fn();
    const { rerender } = render(<Board onMove={onMove} />);
    startAndPreview();
    rerender(<Board onMove={onMove} disabled />);
    expect(screen.queryByText("Overlay a")).not.toBeInTheDocument();
    act(() =>
      handlers.onDragEnd(
        event({
          id: "content:done",
          type: KanbanDnd.ColumnContent,
          data: { columnId: "done" },
        }),
      ),
    );
    expect(onMove).not.toHaveBeenCalled();
  });
  it("starts a second gesture from authoritative membership after a rejected move", () => {
    const onMove = vi.fn();
    render(<Board onMove={onMove} />);
    startAndPreview();
    act(() =>
      handlers.onDragEnd(
        event({
          id: "content:done",
          type: KanbanDnd.ColumnContent,
          data: { columnId: "done" },
        }),
      ),
    );
    act(() => handlers.onDragStart(event()));
    expect(screen.getByTestId("membership")).toHaveTextContent(
      JSON.stringify(value.items),
    );
    act(() => handlers.onDragEnd(event()));
    expect(onMove).toHaveBeenCalledTimes(1);
  });
});

it.each([
  { drop: "over the reported target", targetFound: true, x: 1, commits: true },
  {
    drop: "over the projected source",
    targetFound: false,
    x: 1,
    commits: true,
  },
  { drop: "outside the board", targetFound: false, x: 11, commits: false },
])(
  "ColumnPreview commits the reorder only for a valid drop $drop",
  ({ targetFound, x, commits }) => {
    const onMove = vi.fn();
    render(
      <Kanban.Root value={value} onMove={onMove} renderOverlay={() => null}>
        {(projected) => <output>{projected.columnOrder.join(",")}</output>}
      </Kanban.Root>,
    );
    const element = document.createElement("div");
    const columnEvent = {
      ...event(),
      operation: {
        ...event().operation,
        source: { id: "todo", type: KanbanDnd.Column, element },
        target: {
          id: "done",
          type: KanbanDnd.Column,
          shape: { center: { x: 0, y: 0 } },
        },
        position: { current: { x: 1, y: 0 } },
      },
    } as unknown as DragStartEvent & DragOverEvent & DragEndEvent;
    act(() => handlers.onDragStart(columnEvent));
    act(() => handlers.onDragOver(columnEvent));
    act(() => handlers.onDragOver(columnEvent));
    expect(screen.getByRole("status")).toHaveTextContent("done,todo");
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue(
      new DOMRect(targetFound ? 20 : 0, 0, 10, 10),
    );
    act(() =>
      handlers.onDragEnd({
        ...columnEvent,
        operation: {
          ...columnEvent.operation,
          target: targetFound ? columnEvent.operation.target : null,
          position: { current: { x, y: 1 } },
        },
      } as unknown as DragEndEvent),
    );
    if (!commits) {
      expect(onMove).not.toHaveBeenCalled();
      return;
    }
    expect(onMove).toHaveBeenCalledExactlyOnceWith({
      type: KanbanDnd.Column,
      id: "todo",
      beforeId: null,
    });
  },
);
