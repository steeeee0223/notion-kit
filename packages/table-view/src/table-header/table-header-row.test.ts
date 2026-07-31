import type { DragEndEvent } from "@dnd-kit/react";
import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { useColumnDragEnd } from "./table-header-row";

function dragEndEvent({
  canceled = false,
  source = { id: "notes", initialIndex: 1, index: 2 },
  target = { id: "notes" },
}: {
  canceled?: boolean;
  source?: { id: string; initialIndex?: number; index?: number } | null;
  target?: { id: string } | null;
} = {}) {
  return {
    canceled,
    operation: {
      canceled,
      source,
      target,
      transform: { x: 130, y: 0 },
    },
  } as unknown as DragEndEvent;
}

it.each([
  ["Canceled", dragEndEvent({ canceled: true })],
  ["MissingSource", dragEndEvent({ source: null })],
  ["MissingTarget", dragEndEvent({ target: null })],
  ["DifferentTarget", dragEndEvent({ target: { id: "score" } })],
  [
    "UnchangedSelfTarget",
    dragEndEvent({
      source: { id: "notes", initialIndex: 1, index: 1 },
    }),
  ],
])("ColumnDragEnd_%s_InvokesHandlerSynchronously", (_scenario, event) => {
  const handler = vi.fn<(event: DragEndEvent) => void>();
  const { result } = renderHook(() => useColumnDragEnd(handler));

  act(() => result.current(event));

  expect(handler).toHaveBeenCalledOnce();
  expect(handler).toHaveBeenCalledWith(event);
});

it("ColumnDragEnd_ProjectedSelfTarget_DefersStableSortableProjection", () => {
  vi.useFakeTimers();
  try {
    const source = { id: "notes", initialIndex: 1, index: 2 };
    const target = { id: "notes" };
    const event = dragEndEvent({ source, target });
    const handler = vi.fn<(event: DragEndEvent) => void>();
    const { result } = renderHook(() => useColumnDragEnd(handler));

    act(() => result.current(event));

    expect(handler).not.toHaveBeenCalled();
    source.index = 1;
    target.id = "score";
    act(() => {
      vi.runAllTimers();
    });

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0]![0]).toMatchObject({
      canceled: false,
      operation: {
        canceled: false,
        source: { id: "notes", initialIndex: 1, index: 2 },
        target: { id: "notes" },
        transform: { x: 130, y: 0 },
      },
    });
  } finally {
    vi.useRealTimers();
  }
});

it("ColumnDragEnd_UnmountedBeforeDeferredCallback_CancelsHandler", () => {
  vi.useFakeTimers();
  try {
    const handler = vi.fn<(event: DragEndEvent) => void>();
    const { result, unmount } = renderHook(() => useColumnDragEnd(handler));

    act(() => result.current(dragEndEvent()));
    unmount();
    act(() => {
      vi.runAllTimers();
    });

    expect(handler).not.toHaveBeenCalled();
  } finally {
    vi.useRealTimers();
  }
});

it("ColumnDragEnd_HandlerReplacement_CancelsPendingCallback", () => {
  vi.useFakeTimers();
  try {
    const firstHandler = vi.fn<(event: DragEndEvent) => void>();
    const secondHandler = vi.fn<(event: DragEndEvent) => void>();
    const { result, rerender } = renderHook(
      ({ handler }) => useColumnDragEnd(handler),
      { initialProps: { handler: firstHandler } },
    );

    act(() => result.current(dragEndEvent()));
    rerender({ handler: secondHandler });
    act(() => {
      vi.runAllTimers();
    });

    expect(firstHandler).not.toHaveBeenCalled();
    expect(secondHandler).not.toHaveBeenCalled();
  } finally {
    vi.useRealTimers();
  }
});
