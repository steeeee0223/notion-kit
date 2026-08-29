import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { LayoutType } from "@notion-kit/table-hook";

import { renderTableView } from "../__tests__/component-objects/render-table-view";
import { createFullPluginFixture, mockResizeObserver } from "../__tests__/mock";

mockResizeObserver();

describe.each<LayoutType>(["table", "list", "board", "timeline"])(
  "ViewControls in the %s layout",
  (layout) => {
    it("shows shared toolbar actions without an inactive bar", () => {
      const tableView = renderTableView({ view: { layout } });

      expect(tableView.button("Search")).toBeVisible();
      expect(tableView.button("Filter")).toBeVisible();
      expect(screen.queryByTestId("table-view-active-bar")).toBeNull();
    });

    it("shows the shared active bar and sort selector for an active sort", async () => {
      const tableView = renderTableView({ view: { layout } });
      const sortMenu = await tableView.openSortMenu();

      await sortMenu.addRule("Name");
      await tableView.clickOutside();

      const activeBar = screen.getByTestId("table-view-active-bar");
      expect(activeBar).toBeVisible();
      expect(
        within(activeBar).getByRole("button", { name: "Name" }),
      ).toBeVisible();
    });
  },
);

describe("ViewControls stacking", () => {
  it("keeps a full row view above the shared controls", () => {
    const fixture = createFullPluginFixture();

    renderTableView({
      ...fixture,
      view: {
        ...fixture.view,
        layout: "table",
        openedRowId: "row-alpha",
        rowView: "full",
      },
    });

    expect(document.querySelector("section#row-alpha")).toHaveClass(
      "z-(--z-menu)",
    );
  });
});

describe("ViewControls active filters", () => {
  it("treats malformed persisted filters as inactive and recoverable", async () => {
    const tableView = renderTableView({
      view: {
        layout: "table",
        filters: { kind: "group", id: "malformed", logic: "and" } as never,
      },
    });

    expect(screen.queryByTestId("table-view-active-bar")).toBeNull();

    await tableView.clickButton("Filter");

    expect(
      await screen.findByRole("button", { name: "Add filter rule" }),
    ).toBeVisible();
  });

  it("shows the active bar for a rule nested below the root group", () => {
    renderTableView({
      view: {
        layout: "table",
        filters: {
          kind: "group",
          id: "root-filter",
          logic: "and",
          children: [
            {
              kind: "group",
              id: "nested-filter",
              logic: "or",
              children: [
                {
                  kind: "rule",
                  id: "name-filter",
                  propertyId: "col1",
                  operator: "contains",
                  value: "Task",
                },
              ],
            },
          ],
        },
      },
    });

    expect(screen.getByTestId("table-view-active-bar")).toBeVisible();
  });

  it("shows the recursive rule count and detached filter actions in design order", () => {
    renderTableView({
      view: {
        layout: "table",
        filters: {
          kind: "group",
          id: "root-filter",
          logic: "and",
          children: [
            {
              kind: "rule",
              id: "root-rule",
              propertyId: "col1",
              operator: "contains",
              value: "Task",
            },
            {
              kind: "group",
              id: "nested-filter",
              logic: "or",
              children: [
                {
                  kind: "rule",
                  id: "nested-rule",
                  propertyId: "col1",
                  operator: "contains",
                  value: "Note",
                },
              ],
            },
          ],
        },
      },
    });

    const activeBar = screen.getByTestId("table-view-active-bar");
    const filterPill = within(activeBar).getByRole("button", {
      name: "2 rules",
    });
    const addFilter = within(activeBar).getByRole("button", {
      name: "+ Filter",
    });

    expect(filterPill).toHaveAttribute("aria-haspopup", "dialog");
    expect(filterPill).toHaveAttribute("aria-expanded", "false");
    expect(addFilter).toHaveAttribute("aria-haspopup", "dialog");
    expect(filterPill.compareDocumentPosition(addFilter)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("keeps the empty filter menu open when clearing its final rule", async () => {
    const tableView = renderTableView({
      view: {
        layout: "table",
        filters: {
          kind: "group",
          id: "root-filter",
          logic: "and",
          children: [
            {
              kind: "rule",
              id: "only-rule",
              propertyId: "col1",
              operator: "contains",
              value: "Task",
            },
          ],
        },
      },
    });
    const sortMenu = await tableView.openSortMenu();
    await sortMenu.addRule("Name");
    await tableView.clickOutside();
    const activeBar = screen.getByTestId("table-view-active-bar");
    await tableView.user.click(
      within(activeBar).getByRole("button", { name: "1 rule" }),
    );

    await tableView.filterMenu().deleteNode("only-rule");

    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "1 rule" }),
      ).not.toBeInTheDocument(),
    );
    expect(tableView.filterMenu().emptyAddRule()).toBeVisible();
    const remainingActiveBar = screen.getByTestId("table-view-active-bar");
    expect(
      within(remainingActiveBar).getByRole("button", { name: "Name" }),
    ).toBeVisible();
  });
});
