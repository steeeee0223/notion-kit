import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import {
  CalendarContent,
  CalendarEvent,
  CalendarHeaderToolbar,
  CalendarProvider,
} from "../index";

const anchor = Date.parse("2026-09-16T12:00Z");
const event = {
  id: "event",
  name: "Design review",
  startAt: anchor,
  endAt: anchor + 3600000,
  allDay: false,
};
it("CalendarNavigation_ControlledOwnerRejectsThenAccepts_PresentsAuthoritativePeriod", async () => {
  const user = userEvent.setup();
  const onAnchorDateChange = vi.fn();
  const view = render(
    <CalendarProvider
      events={[]}
      anchorDate={anchor}
      onAnchorDateChange={onAnchorDateChange}
      timeZone="UTC"
    >
      <CalendarHeaderToolbar />
      <CalendarContent />
    </CalendarProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Next" }));
  expect(onAnchorDateChange).toHaveBeenCalledWith(
    Date.parse("2026-10-16T12:00Z"),
  );
  expect(screen.getByText("September 2026")).toBeInTheDocument();
  view.rerender(
    <CalendarProvider
      events={[]}
      anchorDate={Date.parse("2026-10-16T12:00Z")}
      timeZone="UTC"
    >
      <CalendarHeaderToolbar />
      <CalendarContent />
    </CalendarProvider>,
  );
  expect(screen.getByText("October 2026")).toBeInTheDocument();
});
it.each(["monthly", "weekly", "daily"] as const)(
  "CalendarComposition_%s_OpensCustomEventAndCreatesFromKeyboard",
  async (range) => {
    const user = userEvent.setup();
    const onEventClick = vi.fn();
    const onCreate = vi.fn();
    render(
      <CalendarProvider
        events={[event]}
        defaultAnchorDate={anchor}
        defaultRange={range}
        timeZone="UTC"
        onEventClick={onEventClick}
        onCreate={onCreate}
      >
        <CalendarContent
          renderEvent={(props) => (
            <CalendarEvent.Root {...props}>
              <CalendarEvent.Item>Custom title</CalendarEvent.Item>
            </CalendarEvent.Root>
          )}
        />
      </CalendarProvider>,
    );
    const card = screen.getByRole("button", { name: "Design review" });
    card.focus();
    await user.keyboard("{Enter}");
    expect(onEventClick).toHaveBeenCalledWith(event);
    const owner = screen.getByRole("group", {
      name: range === "monthly" ? "Month calendar" : "All-day events",
    });
    if (range !== "monthly") {
      const scroller = owner.closest<HTMLElement>(
        '[data-slot="calendar-view"]',
      )!;
      expect(scroller.scrollTop).toBeGreaterThan(0);
    }
    const day = within(owner).getByRole("button", {
      name: "Create event on September 16, 2026",
    });
    day.focus();
    await user.keyboard(" ");
    expect(onCreate).toHaveBeenCalledWith({
      startAt: Date.parse("2026-09-16T00:00Z"),
      endAt: null,
      allDay: true,
    });
  },
);
it("CalendarReadOnly_MissingWriteCapabilities_AllowsOpenAndNavigationWithoutCreationOrResize", async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn();
  const onEventChange = vi.fn();
  const onEventClick = vi.fn();
  render(
    <CalendarProvider
      events={[event]}
      defaultAnchorDate={anchor}
      timeZone="UTC"
      readOnly
      onCreate={onCreate}
      onEventChange={onEventChange}
      onEventClick={onEventClick}
    >
      <CalendarHeaderToolbar rangeDisabled />
      <CalendarContent />
    </CalendarProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Design review" }));
  expect(onEventClick).toHaveBeenCalledOnce();
  expect(
    screen.queryByRole("button", { name: "Resize start" }),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Create event on September 16, 2026" }),
  );
  expect(onCreate).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Next" }));
  expect(screen.getByText("October 2026")).toBeInTheDocument();
  expect(
    screen.getByRole("combobox", { name: "Calendar range" }),
  ).toBeDisabled();
});

it("CalendarTimeGrid_LateShortEvent_KeepsReadableMinimumHeight", () => {
  const startAt = Date.parse("2026-09-16T23:59:00Z");
  render(
    <CalendarProvider
      events={[
        {
          id: "late",
          name: "Late event",
          startAt,
          endAt: startAt,
          allDay: false,
        },
      ]}
      defaultRange="daily"
      defaultAnchorDate={startAt}
      timeZone="UTC"
    >
      <CalendarContent />
    </CalendarProvider>,
  );
  const placement = screen
    .getByRole("button", { name: "Late event" })
    .closest<HTMLElement>('[data-slot="calendar-event"]')!.parentElement!;
  expect(Number.parseFloat(placement.style.height)).toBeGreaterThanOrEqual(30);
});
