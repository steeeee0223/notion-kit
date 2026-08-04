import { expect, type Locator, type Page } from "@playwright/test";

import { CellEditorsObject } from "./cell-editors";
import { GroupActionsObject } from "./group-actions";
import { HeaderMenuObject } from "./header-menu";
import type { AccessibleName } from "./menu-surface";
import { RowActionsObject } from "./row-actions";
import { SortMenuObject } from "./sort-menu";
import { ViewSettingsMenuObject } from "./view-settings-menu";

type TableMode = "controlled" | "uncontrolled";
export type TableLayout = "table" | "list" | "board" | "timeline";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface ControlledPropertySnapshot {
  id: string;
  name: string;
  type: string;
  width: string;
  hidden?: boolean;
  isDeleted?: boolean;
  config?: {
    options?: {
      names: string[];
      items: Record<string, { color: string }>;
    };
  };
}

interface ControlledSnapshot {
  dataCount: number;
  propertiesCount: number;
  viewCount: number;
  data: {
    id: string;
    icon?: { type: string; src: string };
    properties: Record<string, { value: unknown }>;
  }[];
  lastDataAction: {
    id: string;
    type: string;
    payload: Record<string, unknown>;
  } | null;
  lastPropertiesAction: {
    id: string;
    type: string;
    payload: Record<string, unknown>;
  } | null;
  properties: ControlledPropertySnapshot[];
  lastViewAction: {
    id: string;
    type: string;
    payload: Record<string, unknown>;
  } | null;
  view: {
    layout: string;
    locked: boolean;
    openedRowId: string | null;
    rowView: string;
    timeline: {
      range: "daily" | "monthly" | "quarterly";
      datePropertyId: string | null;
    };
  };
}

interface RenderedResourceSnapshot {
  data: ControlledSnapshot["data"];
  properties: ControlledPropertySnapshot[];
  view: ControlledSnapshot["view"];
}

export class TableViewObject {
  constructor(readonly page: Page) {}

  static async open(page: Page, mode: TableMode) {
    const table = new TableViewObject(page);
    await page.goto(`/table-view/${mode}`, { waitUntil: "networkidle" });
    await table.table().waitFor({ state: "visible" });
    return table;
  }

  table() {
    return this.page.getByRole("table");
  }

  rows() {
    return this.table().getByRole("row");
  }

  rowTitles() {
    return this.rows().getByRole("button", {
      name: /^(Alpha|Empty|Omega)$/,
      exact: true,
    });
  }

  row(name: AccessibleName) {
    return this.rows().filter({
      has: this.page.getByRole("button", {
        name,
        exact: typeof name === "string",
      }),
    });
  }

  rowBlock(rowId: string) {
    return this.page.locator(
      `[data-block-id="${rowId}"]:not([data-dnd-placeholder])`,
    );
  }

  group(id: string) {
    return this.page.getByRole("group", { name: `Group ${id}`, exact: true });
  }

  groupActions(id: string) {
    return new GroupActionsObject(this.page, this.group(id));
  }

  async expandGroup(id: string) {
    await this.group(id).getByRole("button", { name: "Open" }).click();
  }

  async setLayout(layout: TableLayout) {
    const menu = await (await this.openSettings()).openLayout();
    const label = `${layout[0]?.toUpperCase()}${layout.slice(1)}`;
    await menu.button(label).click();
    await menu.close();
  }

  async groupBy(propertyName: string) {
    const grouping = await (await this.openSettings()).openGrouping();
    await grouping.choose(propertyName);
    await this.page.keyboard.press("Escape");
  }

  async openPrimaryRow(layout: TableLayout, row: { id: string; name: string }) {
    if (layout === "table") {
      const tableRow = this.row(row.name);
      await tableRow.hover();
      await tableRow
        .getByRole("button", { name: "Open in side peek", exact: true })
        .click();
      return;
    }
    if (layout === "list") {
      await this.rowBlock(row.id).getByText(row.name, { exact: true }).click();
      return;
    }
    if (layout === "board") {
      await this.rowBlock(row.id).getByText(row.name, { exact: true }).click();
      return;
    }
    await this.timelineSidebarRow(row.id)
      .getByRole("button", { name: row.name, exact: true })
      .click();
  }

  rowViewProperty(dialog: Locator, propertyName: string) {
    return dialog.getByRole("row", {
      name: new RegExp(`^${escapeRegExp(propertyName)}(?: |$)`),
    });
  }

  rowViewPropertyLabel(dialog: Locator, propertyName: string) {
    return this.rowViewProperty(dialog, propertyName).getByRole("button", {
      name: propertyName,
      exact: true,
    });
  }

  rowViewPropertyValue(dialog: Locator, propertyName: string) {
    return this.rowViewProperty(dialog, propertyName)
      .getByRole("cell")
      .nth(1)
      .getByRole("button")
      .first();
  }

  button(name: AccessibleName) {
    return this.page.getByRole("button", { name });
  }

  settingsButton() {
    return this.button("Settings");
  }

  sortButton() {
    return this.page.getByRole("button", { name: "Sort", exact: true });
  }

  header(name: string) {
    return this.table().getByRole("button", { name, exact: true });
  }

  cell(rowName: AccessibleName, accessibleName: AccessibleName) {
    return this.row(rowName).getByRole("button", {
      name: accessibleName,
      exact: typeof accessibleName === "string",
    });
  }

  cellEditor(rowName: AccessibleName, accessibleName: AccessibleName) {
    return new CellEditorsObject(this.page, this.cell(rowName, accessibleName));
  }

  checkboxCell(rowName: AccessibleName) {
    const row = this.row(rowName);
    return row
      .getByRole("button")
      .filter({ has: this.page.getByRole("checkbox") });
  }

  async editTextCell(
    rowName: AccessibleName,
    currentValue: AccessibleName,
    nextValue: string,
  ) {
    await this.cellEditor(rowName, currentValue).fill(nextValue);
  }

  internalState() {
    return this.page.getByTestId("internal-state");
  }

  controlledState() {
    return this.page.getByTestId("controlled-state");
  }

  renderedResourceState() {
    return this.page.getByTestId("rendered-resource-state");
  }

  async controlledSnapshot(): Promise<ControlledSnapshot> {
    return JSON.parse(
      (await this.controlledState().textContent()) ?? "{}",
    ) as ControlledSnapshot;
  }

  async renderedResourceSnapshot(): Promise<RenderedResourceSnapshot> {
    return JSON.parse(
      (await this.renderedResourceState().textContent()) ?? "{}",
    ) as RenderedResourceSnapshot;
  }

  timeline() {
    return this.page.locator('[data-slot="timeline-view"]');
  }

  timelineContent() {
    return this.timeline().locator('[data-slot="timeline-view-content"]');
  }

  timelineSidebar() {
    return this.page.getByRole("complementary", {
      name: "Timeline table",
      exact: true,
    });
  }

  timelineSidebarRow(rowId: string) {
    return this.timelineSidebar().locator(
      `[data-slot="timeline-sidebar-row"][data-row-id="${rowId}"]`,
    );
  }

  timelineTrackRow(rowId: string) {
    return this.timelineContent().locator(
      `[data-slot="timeline-track-row"][data-row-id="${rowId}"]`,
    );
  }

  timelineSidebarGroup(rowId: string) {
    return this.timelineSidebar().locator(
      `[data-slot="timeline-sidebar-group"][data-row-id="${rowId}"]`,
    );
  }

  timelineGroupTrack(rowId: string) {
    return this.timelineContent().locator(
      `[data-slot="timeline-group-spacer"][data-row-id="${rowId}"]`,
    );
  }

  timelineItemCard(rowId: string) {
    return this.timelineTrackRow(rowId).locator(
      '[data-slot="timeline-item-card"]',
    );
  }

  timelineResizer(rowId: string, direction: "start" | "end") {
    return this.timelineTrackRow(rowId).locator(
      `[data-slot="timeline-item-resizer"][data-direction="${direction}"]`,
    );
  }

  async setTimelineRange(range: "Day" | "Month" | "Quarter") {
    await this.timeline()
      .locator(
        '[data-slot="timeline-header-toolbar"] [data-slot="select-trigger"][role="combobox"]',
      )
      .click();
    await this.page.getByRole("option", { name: range, exact: true }).click();
    const columnWidth = range === "Day" ? "50px" : "150px";
    await expect
      .poll(() =>
        this.timeline().evaluate((element) =>
          getComputedStyle(element).getPropertyValue("--timeline-column-width"),
        ),
      )
      .toBe(columnWidth);
  }

  async toggleTimelineGroup(rowId: string, currentlyExpanded: boolean) {
    await this.timelineSidebarGroup(rowId)
      .getByRole("button", {
        name: currentlyExpanded ? "Close" : "Open",
        exact: true,
        expanded: currentlyExpanded,
      })
      .click();
  }

  async dragPointerBy(source: Locator, deltaX: number, deltaY = 0) {
    await source.scrollIntoViewIfNeeded();
    const box = await source.boundingBox();
    if (!box) throw new Error("Drag source has no visible bounding box");
    const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    await this.page.mouse.move(start.x, start.y);
    await this.page.mouse.down();
    await this.page.mouse.move(start.x + deltaX, start.y + deltaY, {
      steps: 12,
    });
    await this.page.mouse.up();
  }

  async resizeTimelineToNextDay(rowId: string) {
    const source = this.timelineResizer(rowId, "end");
    await source.scrollIntoViewIfNeeded();
    await source.hover();
    await expect(source).toHaveAttribute("aria-disabled", "false");
    const sourceBox = await source.boundingBox();
    if (!sourceBox) throw new Error("Timeline resizer has no bounding box");
    const start = {
      x: sourceBox.x + sourceBox.width / 2,
      y: sourceBox.y + sourceBox.height / 2,
    };
    const initialLabel = await source.textContent();
    const dayBoxes = await Promise.all(
      (
        await this.timelineContent()
          .locator('[data-slot="timeline-sub-range"]')
          .all()
      ).map((day) => day.boundingBox()),
    );
    const nextDay = dayBoxes
      .filter((box): box is NonNullable<typeof box> => box !== null)
      .filter((box) => box.x > start.x)
      .sort((a, b) => a.x - b.x)[0];
    if (!nextDay) throw new Error("No rendered Timeline day follows resizer");
    const targetX = nextDay.x + nextDay.width / 2;
    const activeSource = this.timelineTrackRow(rowId).locator(
      '[data-slot="timeline-item-resizer"][data-direction="end"][data-dnd-dragging="true"]',
    );

    await this.page.mouse.move(start.x, start.y);
    await this.page.mouse.down();
    await this.page.mouse.move(start.x + 12, start.y, { steps: 2 });
    await expect(activeSource).toBeVisible();
    await this.page.mouse.move(targetX, start.y, { steps: 12 });
    await this.page.mouse.move(targetX + 1, start.y);
    await expect.poll(() => activeSource.textContent()).not.toBe(initialLabel);
    await this.page.mouse.up();
  }

  calculation(propertyName: string) {
    return this.table().getByRole("button", {
      name: `${propertyName} calculation`,
      exact: true,
    });
  }

  async setCalculation(propertyName: string, method: string) {
    const category = method.startsWith("Percent") ? "Percent" : "Count";
    const trigger = this.calculation(propertyName);
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const categoryItem = this.page
      .getByRole("menuitem", { name: category, exact: true })
      .last();
    await categoryItem.hover();
    const option = this.page
      .getByRole("menuitemcheckbox", { name: method, exact: true })
      .last();
    await option.click();
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await option.waitFor({ state: "hidden" });
  }

  async openSettings() {
    await this.settingsButton().click();
    return ViewSettingsMenuObject.open(this.page);
  }

  async openSort() {
    await this.sortButton().click();
    return SortMenuObject.open(this.page);
  }

  async openHeader(name: string) {
    await this.header(name).click();
    return HeaderMenuObject.open(this.page);
  }

  async openRowActions(rowName: AccessibleName) {
    const row = this.row(rowName);
    return this.openRowActionsFor(row);
  }

  async openRowActionsFor(row: Locator) {
    await row.hover();
    await row.getByRole("button", { name: "Row actions", exact: true }).click();
    return RowActionsObject.open(this.page);
  }

  async drag(source: Locator, target: Locator) {
    await source.dragTo(target);
  }
}
