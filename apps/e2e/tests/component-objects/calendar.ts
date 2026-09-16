import { expect, type Locator, type Page } from "@playwright/test";

interface CalendarEventReference {
  id: string;
  name: string;
  segmentDay?: string;
}
interface EventValue {
  id: string;
  name: string;
  startAt: number;
  endAt: number | null;
  allDay: boolean;
}
interface CalendarSnapshot {
  events: EventValue[];
  range: "daily" | "weekly" | "monthly";
  anchorDate: number;
  createCount: number;
  changeCount: number;
  openCount: number;
  openedId: string | null;
  lastChange: {
    id: string;
    startAt: number;
    endAt: number | null;
    allDay: boolean;
    reason: string;
  } | null;
}

function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

export class CalendarObject {
  readonly root: Locator;
  constructor(readonly page: Page) {
    this.root = page.locator('[data-slot="calendar-view"]');
  }
  static async open(page: Page, range: "Month" | "Week" | "Day" = "Month") {
    await page.addInitScript((now) => {
      const original = Date.now;
      const offset = now - original();
      Date.now = () => original() + offset;
    }, Date.parse("2026-09-16T12:00:00Z"));
    await page.goto(`/calendar?range=${range.toLowerCase()}`);
    const calendar = new CalendarObject(page);
    await expect(calendar.root).toBeVisible();
    return calendar;
  }
  toolbar() {
    return this.root.locator('[data-slot="calendar-header-toolbar"]');
  }
  async setRange(range: "Month" | "Week" | "Day") {
    await this.root
      .getByRole("combobox", { name: "Calendar range", exact: true })
      .click();
    await this.page.getByRole("option", { name: range, exact: true }).click();
    await expect(this.page.getByRole("listbox")).toBeHidden();
  }
  async next() {
    await this.toolbar()
      .getByRole("button", { name: "Next", exact: true })
      .click();
  }
  async toggleRejectedChanges() {
    await this.page
      .getByRole("button", { name: "Reject event changes", exact: true })
      .click();
  }
  async toggleDarkMode() {
    await this.page
      .getByRole("button", { name: "Dark mode", exact: true })
      .click();
  }
  async showDstWeek() {
    await this.page
      .getByRole("button", { name: "Show DST week", exact: true })
      .click();
  }
  event(reference: CalendarEventReference) {
    const segment = reference.segmentDay
      ? `[data-segment-day="${Date.parse(`${reference.segmentDay}T00:00:00Z`)}"]`
      : "";
    return this.root.locator(
      `[data-slot="calendar-event"][data-event-id="${reference.id}"]${segment}`,
    );
  }
  card(reference: CalendarEventReference) {
    return this.event(reference).getByRole("button", {
      name: reference.name,
      exact: true,
    });
  }
  resize(reference: CalendarEventReference, edge: "start" | "end") {
    return this.event(reference).getByRole("button", {
      name: `Resize ${edge}`,
      exact: true,
    });
  }
  day(date: string, area: "month" | "all-day" = "month") {
    return this.root
      .getByRole("group", {
        name: area === "month" ? "Month calendar" : "All-day events",
        exact: true,
      })
      .getByRole("button", {
        name: `Create event on ${dateLabel(date)}`,
        exact: true,
      });
  }
  timeColumn(date: string) {
    return this.root.getByRole("button", {
      name: `Create timed event on ${dateLabel(date)}`,
      exact: true,
    });
  }
  async snapshot(): Promise<CalendarSnapshot> {
    return JSON.parse(
      (await this.page.getByTestId("calendar-state").textContent()) ?? "{}",
    ) as CalendarSnapshot;
  }
  async geometry() {
    return this.root.evaluate((root) => {
      const toolbar = root
        .querySelector('[data-slot="calendar-header-toolbar"]')!
        .getBoundingClientRect();
      const header = root
        .querySelector('[data-slot="calendar-range-header"]')!
        .getBoundingClientRect();
      return {
        scrollWidth: root.scrollWidth,
        clientWidth: root.clientWidth,
        rootTop: root.getBoundingClientRect().top,
        toolbarTop: toolbar.top,
        toolbarBottom: toolbar.bottom,
        headerTop: header.top,
        headerBottom: header.bottom,
      };
    });
  }
  async scrollBy(amount: number) {
    await this.root.evaluate((root, delta) => {
      root.scrollTop += delta;
    }, amount);
  }
  private async revealTime(minute: number) {
    await this.root.evaluate((root, target) => {
      const grid = root.querySelector<HTMLElement>(
        '[data-slot="calendar-time-grid"]',
      );
      if (!grid) throw new Error("Calendar time grid is missing");
      root.scrollTop = grid.offsetTop + target - root.clientHeight / 2;
    }, minute);
  }
  async timePoint(date: string, minute: number) {
    const box = await this.timeColumn(date).boundingBox();
    if (!box) throw new Error(`Calendar timed column ${date} is missing`);
    return {
      x: box.x + box.width / 2,
      y: box.y + (minute / 1440) * box.height,
    };
  }
  async createOnDay(date: string, area: "month" | "all-day" = "month") {
    const day = this.day(date, area);
    await day.focus();
    await this.page.keyboard.press("Enter");
  }
  async createAtTime(date: string, minute: number) {
    await this.revealTime(minute);
    const point = await this.timePoint(date, minute);
    await this.page.mouse.click(point.x, point.y + 2);
  }
  private async beginDrag(source: Locator) {
    await source.scrollIntoViewIfNeeded();
    const box = await source.boundingBox();
    if (!box) throw new Error("Calendar drag source is missing");
    const container = await this.root.boundingBox();
    const header = await this.root
      .locator('[data-slot="calendar-range-header"]')
      .boundingBox();
    if (!container || !header)
      throw new Error("Calendar viewport geometry is missing");
    const visibleTop = Math.max(box.y, header.y + header.height);
    const visibleBottom = Math.min(
      box.y + box.height,
      container.y + container.height,
    );
    const x = box.x + Math.min(14, box.width / 2);
    const y = visibleTop + Math.min(12, (visibleBottom - visibleTop) / 2);
    await this.page.mouse.move(x, y);
    await this.page.mouse.down();
    await this.page.mouse.move(x + 8, y + 2, { steps: 2 });
  }
  async moveToDay(
    reference: CalendarEventReference,
    date: string,
    area: "month" | "all-day" = "month",
  ) {
    await this.beginDrag(this.card(reference));
    const target = this.day(date, area);
    await target.scrollIntoViewIfNeeded();
    const box = await target.boundingBox();
    if (!box) throw new Error("Calendar day target is missing");
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height - 12, {
      steps: 12,
    });
    await this.page.mouse.up();
  }
  async moveToTime(
    reference: CalendarEventReference,
    date: string,
    minute: number,
    options: { cancel?: boolean } = {},
  ) {
    await this.beginDrag(this.card(reference));
    await this.revealTime(minute);
    const point = await this.timePoint(date, minute);
    await this.page.mouse.move(point.x, point.y, { steps: 12 });
    if (options.cancel) await this.page.keyboard.press("Escape");
    await this.page.mouse.up();
  }
  async resizeToTime(
    reference: CalendarEventReference,
    edge: "start" | "end",
    date: string,
    minute: number,
  ) {
    await this.card(reference).hover();
    await this.beginDrag(this.resize(reference, edge));
    await this.revealTime(minute);
    const point = await this.timePoint(date, minute);
    await this.page.mouse.move(point.x, point.y, { steps: 12 });
    await this.page.mouse.up();
  }
  async dragToEdge(reference: CalendarEventReference, edge: "top" | "bottom") {
    await this.beginDrag(this.card(reference));
    const before = await this.root.evaluate((root) => root.scrollTop);
    const box = await this.root.boundingBox();
    const card = await this.card(reference).boundingBox();
    if (!box || !card)
      throw new Error("Calendar auto-scroll geometry is missing");
    await this.page.mouse.move(
      card.x + card.width / 2,
      edge === "bottom" ? box.y + box.height - 8 : box.y + 8,
      { steps: 8 },
    );
    if (edge === "bottom") {
      await expect
        .poll(() => this.root.evaluate((root) => root.scrollTop))
        .toBeGreaterThan(before + 100);
    } else {
      await expect
        .poll(() => this.root.evaluate((root) => root.scrollTop))
        .toBeLessThan(before - 100);
      const header = await this.root
        .locator('[data-slot="calendar-range-header"]')
        .boundingBox();
      if (!header) throw new Error("Calendar date header is missing");
      await this.page.mouse.move(
        card.x + card.width / 2,
        header.y + header.height + 24,
        { steps: 4 },
      );
    }
    await this.page.mouse.up();
  }
}
