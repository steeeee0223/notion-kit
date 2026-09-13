import { screen, within } from "@testing-library/react";

export class TimelineViewObject {
  root() {
    return document.querySelector<HTMLElement>('[data-slot="timeline-view"]')!;
  }

  sidebar() {
    return screen.getByRole("complementary", { name: "Timeline table" });
  }

  sidebarRow(rowId: string) {
    return document.querySelector<HTMLElement>(
      `[data-slot="timeline-sidebar-row"][data-row-id="${rowId}"]`,
    )!;
  }

  trackRow(rowId: string) {
    return document.querySelector<HTMLElement>(
      `[data-slot="timeline-track-row"][data-row-id="${rowId}"]`,
    )!;
  }

  item(rowId?: string) {
    const root = rowId ? this.trackRow(rowId) : document;
    return root.querySelector<HTMLElement>('[data-slot="timeline-item"]')!;
  }

  items() {
    return document.querySelectorAll<HTMLElement>(
      '[data-slot="timeline-item"]',
    );
  }

  sidebarTitle(rowId: string, name: string) {
    return within(this.sidebarRow(rowId)).getByText(name, { exact: true });
  }

  itemTitle(rowId: string, name: string) {
    return within(this.trackRow(rowId)).getByRole("button", { name });
  }

  itemCard(rowId: string) {
    return this.trackRow(rowId).querySelector<HTMLElement>(
      '[data-slot="timeline-item-card"]',
    )!;
  }

  resizers(rowId?: string) {
    const root = rowId ? this.trackRow(rowId) : document;
    return root.querySelectorAll<HTMLElement>(
      '[data-slot="timeline-item-resizer"]',
    );
  }

  resizer(rowId: string, direction: "start" | "end") {
    return this.trackRow(rowId).querySelector<HTMLElement>(
      `[data-slot="timeline-item-resizer"][data-direction="${direction}"]`,
    )!;
  }

  addTrack() {
    return document.querySelector<HTMLElement>(
      '[data-slot="timeline-add-feature-track"]',
    )!;
  }

  sidebarProjection() {
    return this.rowIds(
      '[data-slot="timeline-sidebar-group"], [data-slot="timeline-sidebar-row"]',
    );
  }

  trackProjection() {
    return this.rowIds(
      '[data-slot="timeline-group-spacer"], [data-slot="timeline-track-row"]',
    );
  }

  sidebarRows() {
    return document.querySelectorAll<HTMLElement>(
      '[data-slot="timeline-sidebar-row"]',
    );
  }

  closestSidebarRow(element: HTMLElement) {
    return element.closest<HTMLElement>('[data-slot="timeline-sidebar-row"]');
  }

  trackRows() {
    return document.querySelectorAll<HTMLElement>(
      '[data-slot="timeline-track-row"]',
    );
  }

  groupSpacers() {
    return document.querySelectorAll<HTMLElement>(
      '[data-slot="timeline-group-spacer"]',
    );
  }

  private rowIds(selector: string) {
    return Array.from(document.querySelectorAll(selector), (element) =>
      element.getAttribute("data-row-id"),
    );
  }
}
