import { describe, expect, it } from "vitest";

import { renderTableView } from "../__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "../__tests__/mock";

mockResizeObserver();

async function openLayoutMenu() {
  const tableView = renderTableView();
  const settings = await tableView.openViewSettings();
  return settings.openLayout();
}

describe("LayoutMenu", () => {
  it("LayoutMenu_Open_ShowsLayoutOptions", async () => {
    const layout = await openLayoutMenu();
    expect(layout.layoutButton("Table")).toBeVisible();
    expect(layout.layoutButton("Board")).toBeVisible();
    expect(layout.layoutButton("List")).toBeVisible();
  });

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

  it("LayoutMenu_BackNavigation_ReturnsToViewSettings", async () => {
    const layout = await openLayoutMenu();
    const settings = await layout.backToViewSettings();
    expect(settings.heading("View Settings")).toBeVisible();
  });
});
