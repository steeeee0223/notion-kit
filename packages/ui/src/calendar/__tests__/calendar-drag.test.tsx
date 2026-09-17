import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { CalendarContent, CalendarProvider } from "../index";

const day = 86400000;
const anchor = Date.parse("2026-09-16T00:00Z");
const initial = {
  id: "event",
  name: "Planning",
  startAt: anchor,
  endAt: anchor + 2 * day,
  allDay: true,
};
function rect(x: number, y: number, width: number, height: number): DOMRect {
  return {
    x,
    y,
    left: x,
    top: y,
    width,
    height,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({}),
  };
}
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function (this: HTMLElement) {
      if (this.dataset.slot === "calendar-range-header")
        return rect(0, 0, 700, 32);
      if (this.dataset.slot === "calendar-view") return rect(0, 0, 700, 600);
      const owner = this.closest<HTMLElement>("[data-event-id]");
      if (owner) {
        const timestamp = Number(owner.dataset.segmentDay);
        const index = Math.round(
          (timestamp - Date.parse("2026-08-31T00:00Z")) / day,
        );
        return rect(
          (index % 7) * 100,
          Math.floor(index / 7) * 120 + 32,
          200,
          26,
        );
      }
      if (this.dataset.calendarDrop) {
        const index = Math.round(
          (Number(this.dataset.day) - Date.parse("2026-08-31T00:00Z")) / day,
        );
        return rect((index % 7) * 100, Math.floor(index / 7) * 120, 100, 120);
      }
      return rect(0, 0, 700, 600);
    },
  );
});
afterEach(() => vi.restoreAllMocks());
async function frame() {
  await act(
    () =>
      new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
  );
}
async function begin(handle: Element) {
  fireEvent.mouseMove(document, { clientX: 225, clientY: 284 });
  fireEvent.pointerDown(handle, {
    clientX: 225,
    clientY: 284,
    button: 0,
    buttons: 1,
    isPrimary: true,
    pointerId: 1,
    pointerType: "mouse",
  });
  await move(245);
}
async function move(x: number, y = 284) {
  fireEvent.mouseMove(document, { clientX: x, clientY: y });
  fireEvent.pointerMove(document, {
    clientX: x,
    clientY: y,
    buttons: 1,
    isPrimary: true,
    pointerId: 1,
    pointerType: "mouse",
  });
  await frame();
}
async function release(x: number) {
  fireEvent.pointerUp(document, {
    clientX: x,
    clientY: 284,
    button: 0,
    buttons: 0,
    isPrimary: true,
    pointerId: 1,
    pointerType: "mouse",
  });
  await frame();
}
it.each([
  ["move", anchor + day, anchor + 3 * day],
  ["resize-start", anchor + day, anchor + 2 * day],
  ["resize-end", anchor, anchor + 3 * day],
] as const)(
  "CalendarGesture_%s_CommitsExactlyOneProposalWithoutOpening",
  async (reason, startAt, endAt) => {
    const onEventChange = vi.fn();
    const onEventClick = vi.fn();
    render(
      <CalendarProvider
        events={[initial]}
        defaultAnchorDate={anchor}
        timeZone="UTC"
        onEventChange={onEventChange}
        onEventClick={onEventClick}
      >
        <CalendarContent />
      </CalendarProvider>,
    );
    const card = screen.getByRole("button", { name: "Planning" });
    const handle =
      reason === "move"
        ? card
        : within(card.closest<HTMLElement>("[data-event-id]")!).getByRole(
            "button",
            { name: reason === "resize-start" ? "Resize start" : "Resize end" },
          );
    await begin(handle);
    await move(reason === "resize-end" ? 425 : 325);
    await release(reason === "resize-end" ? 425 : 325);
    await waitFor(() =>
      expect(onEventChange).toHaveBeenCalledExactlyOnceWith({
        id: "event",
        startAt,
        endAt,
        allDay: true,
        reason,
      }),
    );
    expect(onEventClick).not.toHaveBeenCalled();
    expect(card.closest("[data-event-id]")).toHaveAttribute(
      "data-segment-day",
      String(anchor),
    );
    fireEvent.click(card);
    expect(onEventClick).toHaveBeenCalledOnce();
  },
);
it.each(["escape", "outside", "source-replacement", "period-change"] as const)(
  "CalendarGesture_%s_CancelsWithoutOverwritingAuthoritativeData",
  async (cancel) => {
    const onEventChange = vi.fn();
    const view = render(
      <CalendarProvider
        events={[initial]}
        anchorDate={anchor}
        timeZone="UTC"
        onEventChange={onEventChange}
      >
        <CalendarContent />
      </CalendarProvider>,
    );
    await begin(screen.getByRole("button", { name: "Planning" }));
    await move(325);
    expect(
      screen
        .getByRole("button", { name: "Planning" })
        .closest("[data-event-id]"),
    ).toHaveAttribute("data-dragging", "true");
    if (cancel === "escape")
      fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
    if (cancel === "source-replacement")
      view.rerender(
        <CalendarProvider
          events={[{ ...initial, endAt: anchor + 3 * day }]}
          anchorDate={anchor}
          timeZone="UTC"
          onEventChange={onEventChange}
        >
          <CalendarContent />
        </CalendarProvider>,
      );
    if (cancel === "period-change")
      view.rerender(
        <CalendarProvider
          events={[initial]}
          anchorDate={Date.parse("2026-10-16T00:00Z")}
          timeZone="UTC"
          onEventChange={onEventChange}
        >
          <CalendarContent />
        </CalendarProvider>,
      );
    if (cancel === "outside") await move(900);
    await release(cancel === "outside" ? 900 : 325);
    expect(onEventChange).not.toHaveBeenCalled();
  },
);
it("CalendarResize_TimedEventInMonth_PreservesTheBoundaryLocalTime", async () => {
  const onEventChange = vi.fn();
  render(
    <CalendarProvider
      events={[
        {
          ...initial,
          allDay: false,
          startAt: anchor + 10 * 3600000,
          endAt: anchor + 2 * day + 11 * 3600000,
        },
      ]}
      defaultAnchorDate={anchor}
      timeZone="UTC"
      onEventChange={onEventChange}
    >
      <CalendarContent />
    </CalendarProvider>,
  );
  const card = screen.getByRole("button", { name: "Planning" });
  await begin(
    within(card.closest<HTMLElement>("[data-event-id]")!).getByRole("button", {
      name: "Resize start",
    }),
  );
  await move(325);
  await release(325);
  expect(onEventChange).toHaveBeenCalledExactlyOnceWith({
    id: "event",
    startAt: anchor + day + 10 * 3600000,
    endAt: anchor + 2 * day + 11 * 3600000,
    allDay: false,
    reason: "resize-start",
  });
});

it("CalendarGesture_FinalMoveIntoEdge_ContinuesScrollingWhilePointerIsHeld", async () => {
  render(
    <CalendarProvider
      events={[initial]}
      defaultAnchorDate={anchor}
      timeZone="UTC"
      onEventChange={vi.fn()}
    >
      <CalendarContent />
    </CalendarProvider>,
  );
  const card = screen.getByRole("button", { name: "Planning" });
  const scroller = card.closest<HTMLElement>('[data-slot="calendar-view"]')!;
  await begin(card);
  expect(scroller.scrollTop).toBe(0);
  await move(225, 592);
  await waitFor(() => expect(scroller.scrollTop).toBeGreaterThan(0));
  fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
  await release(225);
});
