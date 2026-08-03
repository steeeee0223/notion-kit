import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { TimelineProvider } from "../timeline-provider";
import { TimelineRow } from "../timeline-row";

it("TimelineRow_ActivatedPointerDragThenReset_NextClickOpensItem", async () => {
  const onMove = vi.fn();
  const onOpen = vi.fn();
  const item = {
    id: "item",
    name: "Item",
    startAt: 0,
    endAt: 86_400_000,
  };
  render(
    <TimelineProvider range="monthly" startDate={0} endDate={2_678_400_000}>
      <TimelineRow.Root item={item} onMove={onMove}>
        <TimelineRow.Track>
          <TimelineRow.Item onClick={onOpen}>Item</TimelineRow.Item>
        </TimelineRow.Track>
      </TimelineRow.Root>
    </TimelineProvider>,
  );

  const card = screen.getByRole("button", { name: "Item" });
  await dragPointer(card, [0, 20, 30, 5]);

  await waitFor(() => expect(onMove).toHaveBeenCalledOnce());
  expect(onOpen).not.toHaveBeenCalled();

  await act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));
  fireEvent.click(card);

  expect(onOpen).toHaveBeenCalledOnce();
});

async function dragPointer(handle: Element, positions: number[]) {
  const [start, ...moves] = positions;
  const coordinates = (position: number) => ({
    clientX: position,
    clientY: 18,
  });

  fireEvent.mouseMove(document, coordinates(start!));
  fireEvent.pointerDown(handle, {
    ...coordinates(start!),
    button: 0,
    buttons: 1,
    isPrimary: true,
    pointerId: 1,
    pointerType: "mouse",
  });
  for (const position of moves) {
    fireEvent.mouseMove(document, coordinates(position));
    fireEvent.pointerMove(document, {
      ...coordinates(position),
      buttons: 1,
      isPrimary: true,
      pointerId: 1,
      pointerType: "mouse",
    });
    await flushAnimationFrame();
  }
  const end = positions.at(-1)!;
  fireEvent.pointerUp(document, {
    ...coordinates(end),
    button: 0,
    buttons: 0,
    isPrimary: true,
    pointerId: 1,
    pointerType: "mouse",
  });
  await flushAnimationFrame();
}

async function flushAnimationFrame() {
  await act(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      }),
  );
}
