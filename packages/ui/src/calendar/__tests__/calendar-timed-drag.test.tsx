import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { CalendarContent, CalendarProvider } from "../index";

const monday = Date.parse("2026-09-14T00:00Z");
const day = 86400000;

function rect(x: number, y: number, width: number, height: number): DOMRect {
  return {
    x,
    y,
    width,
    height,
    left: x,
    top: y,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({}),
  };
}
async function frame() {
  await act(
    () =>
      new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
  );
}

afterEach(() => vi.restoreAllMocks());

it.each([
  {
    scenario: "middle of card",
    startMinute: 600,
    duration: 60,
    grabbedMinute: 645,
    delta: 0,
    segmentOffset: 0,
  },
  {
    scenario: "vertical move",
    startMinute: 600,
    duration: 60,
    grabbedMinute: 645,
    delta: 32,
    segmentOffset: 0,
  },
  {
    scenario: "continuation segment",
    startMinute: 1380,
    duration: 120,
    grabbedMinute: 45,
    delta: 0,
    segmentOffset: 1,
  },
  {
    scenario: "shifted midnight card",
    startMinute: 1439,
    duration: 0,
    grabbedMinute: 1425,
    delta: 0,
    segmentOffset: 0,
  },
  {
    scenario: "off-grid start",
    startMinute: 607.5,
    duration: 60,
    grabbedMinute: 640,
    delta: 0,
    segmentOffset: 0,
  },
])(
  "CalendarTimedDrag_$scenario PreservesGrabOffsetAndSnapsMovement",
  async ({ startMinute, duration, grabbedMinute, delta, segmentOffset }) => {
    const startAt = monday + 2 * day + startMinute * 60000;
    const segmentDay = monday + (2 + segmentOffset) * day;
    const x = (2 + segmentOffset) * 100 + 50;
    const y = 100 + grabbedMinute;
    const onEventChange = vi.fn();
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function (this: HTMLElement) {
        if (this.dataset.slot === "calendar-view") return rect(0, 0, 700, 1700);
        if (this.dataset.slot === "calendar-range-header")
          return rect(0, 0, 700, 32);
        if (this.dataset.calendarDrop) {
          const left = ((Number(this.dataset.day) - monday) / day) * 100;
          return this.dataset.calendarDrop === "time"
            ? rect(left, 100, 100, 1440)
            : rect(left, 32, 100, 68);
        }
        const owner = this.closest<HTMLElement>("[data-event-id]");
        if (owner) {
          const placement = owner.parentElement!;
          return rect(
            ((Number(owner.dataset.segmentDay) - monday) / day) * 100,
            100 + Number.parseFloat(placement.style.top),
            100,
            Number.parseFloat(placement.style.height),
          );
        }
        return rect(0, 0, 700, 1700);
      },
    );
    render(
      <CalendarProvider
        events={[
          {
            id: "meeting",
            name: "Meeting",
            startAt,
            endAt: startAt + duration * 60000,
            allDay: false,
          },
        ]}
        defaultAnchorDate={startAt}
        defaultRange="weekly"
        timeZone="UTC"
        onEventChange={onEventChange}
      >
        <CalendarContent />
      </CalendarProvider>,
    );
    const card = screen
      .getAllByRole("button", { name: "Meeting" })
      .find(
        (item) =>
          item.closest<HTMLElement>("[data-segment-day]")?.dataset
            .segmentDay === String(segmentDay),
      )!;
    const pointer = {
      button: 0,
      buttons: 1,
      isPrimary: true,
      pointerId: 1,
      pointerType: "mouse",
    };
    fireEvent.mouseMove(document, { clientX: x, clientY: y });
    fireEvent.pointerDown(card, { ...pointer, clientX: x, clientY: y });
    for (const point of [
      { clientX: x + 8, clientY: y },
      { clientX: x + 100, clientY: y + delta },
    ]) {
      fireEvent.mouseMove(document, point);
      fireEvent.pointerMove(document, { ...pointer, ...point });
      await frame();
    }
    fireEvent.pointerUp(document, {
      ...pointer,
      buttons: 0,
      clientX: x + 100,
      clientY: y + delta,
    });
    await frame();
    const movedStart = startAt + day + Math.round(delta / 15) * 15 * 60000;
    expect(onEventChange).toHaveBeenCalledExactlyOnceWith({
      id: "meeting",
      startAt: movedStart,
      endAt: movedStart + duration * 60000,
      allDay: false,
      reason: "move",
    });
  },
);
