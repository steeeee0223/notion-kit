import type { DragEndEvent } from "@dnd-kit/react";
import { expect, it, vi } from "vitest";

import { deferColumnDragEnd } from "./table-header-row";

it("ColumnDragEnd_DeferredCallback_UsesStableSortableProjection", () => {
  vi.useFakeTimers();
  try {
    const source = { id: "notes", initialIndex: 1, index: 2 };
    const target = { id: "notes" };
    const event = {
      canceled: false,
      operation: {
        canceled: false,
        source,
        target,
        transform: { x: 130, y: 0 },
      },
    } as unknown as DragEndEvent;
    const handler = vi.fn<(event: DragEndEvent) => void>();

    deferColumnDragEnd(event, handler);

    expect(handler).not.toHaveBeenCalled();
    source.index = 1;
    target.id = "score";
    vi.runAllTimers();

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
