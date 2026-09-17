import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { ColumnDefs } from "@notion-kit/table-hook";

import type { DefaultPlugins } from "@/plugins";

import { renderTableView } from "../__tests__/component-objects/render-table-view";
import { TableViewObject } from "../__tests__/component-objects/table-view";
import { mockResizeObserver } from "../__tests__/mock";
import { TableView } from "../table-contexts";

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

  it("LayoutMenu_CalendarSelection_EnablesAndSelectsCalendar", async () => {
    const layout = await openLayoutMenu();
    expect(layout.layoutButton("Calendar")).toBeEnabled();
    await layout.selectLayout("Calendar");
    expect(layout.layoutButton("Calendar")).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it.each(["timeline", "calendar"] as const)(
    "LayoutMenu_%sDateSelector_ListsOnlyUsableDateProperties",
    async (selectedLayout) => {
      const layout = await openDateLayoutMenu(selectedLayout);

      await layout.openDatePropertyOptions();

      expect(layout.datePropertyOption("Due")).toBeChecked();
      expect(layout.datePropertyOption("Later")).not.toBeChecked();
      expect(
        layout.queryDatePropertyOption("Hidden date"),
      ).not.toBeInTheDocument();
      expect(
        layout.queryDatePropertyOption("Deleted date"),
      ).not.toBeInTheDocument();
      expect(layout.queryDatePropertyOption("Name")).not.toBeInTheDocument();
    },
  );

  it("LayoutMenu_StaleTimelineDateProperty_ShowsAndSelectsFirstUsableDate", async () => {
    const tableView = new TableViewObject(userEvent.setup());
    render(
      <TableView
        data={[]}
        properties={timelineProperties}
        view={{
          layout: "timeline",
          dateView: { range: "monthly", datePropertyId: "hidden" },
        }}
        onViewChange={vi.fn()}
      />,
    );
    const layout = await (await tableView.openViewSettings()).openLayout();

    expect(layout.datePropertyTrigger()).toHaveTextContent("Due");
    await layout.openDatePropertyOptions();
    expect(layout.datePropertyOption("Due")).toBeChecked();
  });

  it.each(["timeline", "calendar"] as const)(
    "LayoutMenu_%sDateSelection_PersistsChosenProperty",
    async (selectedLayout) => {
      const onViewChange = vi.fn();
      const layout = await openDateLayoutMenu(selectedLayout, onViewChange);

      await layout.selectDateProperty("Later");

      expect(onViewChange).toHaveBeenCalledTimes(1);
      expect(onViewChange.mock.calls[0]?.[0]).toMatchObject({
        action: {
          type: "view.date_view_property.change",
          payload: {
            previousDatePropertyId: "due",
            nextDatePropertyId: "later",
          },
        },
      });
    },
  );

  it("LayoutMenu_LockedCalendar_DisablesPersistentLayoutSettings", async () => {
    const onViewChange = vi.fn();
    const tableView = renderTableView({
      data: [],
      properties: timelineProperties,
      view: {
        layout: "calendar",
        locked: true,
        dateView: { datePropertyId: "due" },
      },
      onViewChange,
    });
    const layout = await (await tableView.openViewSettings()).openLayout();
    expect(layout.layoutButton("Timeline")).toBeDisabled();
    expect(layout.datePropertyTrigger()).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(layout.rowViewTrigger()).toHaveAttribute("aria-disabled", "true");
    expect(onViewChange).not.toHaveBeenCalled();
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

const timelineProperties = [
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
] satisfies ColumnDefs<DefaultPlugins>;

async function openDateLayoutMenu(
  selectedLayout: "timeline" | "calendar",
  onViewChange = vi.fn(),
  datePropertyId = "due",
) {
  const tableView = renderTableView({
    properties: timelineProperties,
    data: [],
    view: {
      layout: selectedLayout,
      dateView: { range: "monthly", datePropertyId },
    },
    onViewChange,
  });
  const settings = await tableView.openViewSettings();
  return settings.openLayout();
}
