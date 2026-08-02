import { describe, expect, it, vi } from "vitest";

import type { ColumnInfo } from "@notion-kit/table-hook";

import { renderTableView } from "../__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "../__tests__/mock";

mockResizeObserver();

async function openLayoutMenu() {
  const tableView = renderTableView();
  const settings = await tableView.openViewSettings();
  return settings.openLayout();
}

describe("LayoutMenu", () => {
  it("LayoutMenu_DefaultLayout_SelectsTable", async () => {
    const layout = await openLayoutMenu();
    expect(layout.layoutButton("Table")).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("LayoutMenu_ListSelection_SelectsList", async () => {
    const layout = await openLayoutMenu();
    await layout.selectLayout("List");
    expect(layout.layoutButton("List")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(layout.layoutButton("Table")).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("LayoutMenu_BoardSelection_SelectsBoard", async () => {
    const layout = await openLayoutMenu();
    await layout.selectLayout("Board");
    expect(layout.layoutButton("Board")).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("LayoutMenu_TimelineSelection_EnablesAndSelectsTimeline", async () => {
    const layout = await openLayoutMenu();

    expect(layout.layoutButton("Timeline")).toBeEnabled();
    await layout.selectLayout("Timeline");
    expect(layout.layoutButton("Timeline")).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("LayoutMenu_TimelineDateSelector_ListsOnlyUsableDateProperties", async () => {
    const layout = await openTimelineLayoutMenu();

    await layout.openTimelinePropertyOptions();

    expect(layout.timelinePropertyOption("Due")).toBeChecked();
    expect(layout.timelinePropertyOption("Later")).not.toBeChecked();
    expect(
      layout.queryTimelinePropertyOption("Hidden date"),
    ).not.toBeInTheDocument();
    expect(
      layout.queryTimelinePropertyOption("Deleted date"),
    ).not.toBeInTheDocument();
    expect(layout.queryTimelinePropertyOption("Name")).not.toBeInTheDocument();
  });

  it("LayoutMenu_TimelineDateSelection_PersistsChosenProperty", async () => {
    const onViewChange = vi.fn();
    const layout = await openTimelineLayoutMenu(onViewChange);

    await layout.selectTimelineProperty("Later");

    expect(onViewChange).toHaveBeenCalledTimes(1);
    expect(onViewChange.mock.calls[0]?.[0]).toMatchObject({
      action: {
        type: "view.timeline_property.change",
        payload: {
          previousDatePropertyId: "due",
          nextDatePropertyId: "later",
        },
      },
    });
  });

  it("LayoutMenu_RowViewHover_OpensCheckedSidePeek", async () => {
    const layout = await openLayoutMenu();
    expect(layout.rowViewTrigger()).toHaveTextContent("Side peek");
    expect(layout.queryRowViewOption("Side peek")).not.toBeInTheDocument();
    await layout.openRowViewOptions();
    expect(layout.rowViewOption("Side peek")).toBeChecked();
  });

  it("LayoutMenu_RowViewSelection_StaysOpenAndChecksSelection", async () => {
    const layout = await openLayoutMenu();
    await layout.selectRowView("Center peek");
    expect(layout.heading()).toBeVisible();
    expect(layout.rowViewTrigger()).toHaveTextContent("Center peek");
  });

  it("LayoutMenu_SelectedRowView_DoesNotEmitChange", async () => {
    const onViewChange = vi.fn();
    const tableView = renderTableView({ onViewChange });
    const settings = await tableView.openViewSettings();
    const layout = await settings.openLayout();

    await layout.selectRowView("Side peek");

    expect(onViewChange).not.toHaveBeenCalled();
  });

  it("LayoutMenu_BackNavigation_ReturnsToViewSettings", async () => {
    const layout = await openLayoutMenu();
    const settings = await layout.backToViewSettings();
    expect(settings.heading("View Settings")).toBeVisible();
  });
});

const timelineProperties: ColumnInfo[] = [
  {
    id: "name",
    name: "Name",
    type: "text",
    config: undefined,
  },
  {
    id: "due",
    name: "Due",
    type: "date",
    config: { dateFormat: "full", timeFormat: "24-hour", tz: "UTC" },
  },
  {
    id: "later",
    name: "Later",
    type: "date",
    config: { dateFormat: "full", timeFormat: "24-hour", tz: "UTC" },
  },
  {
    id: "hidden",
    name: "Hidden date",
    type: "date",
    hidden: true,
    config: { dateFormat: "full", timeFormat: "24-hour", tz: "UTC" },
  },
  {
    id: "deleted",
    name: "Deleted date",
    type: "date",
    isDeleted: true,
    config: { dateFormat: "full", timeFormat: "24-hour", tz: "UTC" },
  },
];

async function openTimelineLayoutMenu(onViewChange = vi.fn()) {
  const tableView = renderTableView({
    properties: timelineProperties,
    data: [],
    view: {
      layout: "timeline",
      timeline: { range: "monthly", datePropertyId: "due" },
    },
    onViewChange,
  });
  const settings = await tableView.openViewSettings();
  return settings.openLayout();
}
