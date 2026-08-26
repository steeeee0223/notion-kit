import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ColumnInfo, Row } from "@notion-kit/table-hook";
import type { CellPlugin } from "@notion-kit/table-hook/plugins";

import { DEFAULT_PLUGINS } from "@/plugins";

import { renderTableView } from "../__tests__/component-objects/render-table-view";
import { createFullPluginFixture, mockResizeObserver } from "../__tests__/mock";

mockResizeObserver();

describe("SortMenu", () => {
  it("SortMenu_SearchAndSelect_AddsAscendingRule", async () => {
    const tableView = renderTableView();
    const sort = await tableView.openSortMenu();

    await sort.startAdding();
    await sort.search("Done");
    await tableView.user.click(sort.propertyOption("Done"));

    await waitFor(() => {
      expect(sort.querySearchInput()).not.toBeInTheDocument();
    });
    expect(sort.directionTrigger("col2")).toHaveTextContent(
      "Checked → unchecked",
    );
    expect(sort.moveHandle("col2")).toBeVisible();
  });

  it("SortMenu_DeleteAll_RemovesEveryRule", async () => {
    const tableView = renderTableView();
    const sort = await tableView.openSortMenu();
    await sort.addRule("Name");

    await sort.deleteAll();

    expect(sort.queryDirection("A → Z")).not.toBeInTheDocument();
  });

  it("SortMenu_TypedSearch_RemainsInAddPanel", async () => {
    const tableView = renderTableView();
    const sort = await tableView.openSortMenu();
    await sort.startAdding();

    await sort.search("Done");

    expect(sort.searchInput()).toHaveValue("Done");
    expect(sort.propertyOption("Done")).toBeVisible();
  });

  it("SortMenu_DirectionTrigger_OpensDirectionOptions", async () => {
    const tableView = renderTableView();
    const sort = await tableView.openSortMenu();
    await sort.addRule("Name");

    await sort.openDirection("col1");

    expect(sort.directionOption("Z → A")).toBeVisible();
  });

  it("SortMenu_DirectionSelection_ChangesExistingRule", async () => {
    const tableView = renderTableView();
    const sort = await tableView.openSortMenu();
    await sort.addRule("Name");

    await sort.openDirection("col1");
    await tableView.user.click(sort.directionOption("Z → A"));

    expect(sort.directionTrigger("col1")).toHaveTextContent("Z → A");
  });

  it("SortMenu_PropertySelection_ReplacesRuleProperty", async () => {
    const tableView = renderTableView();
    const sort = await tableView.openSortMenu();
    await sort.addRule("Name");

    await tableView.user.click(sort.propertyTrigger("col1"));
    await tableView.user.click(
      await screen.findByRole("option", { name: "Done" }),
    );

    expect(sort.moveHandle("col2")).toBeVisible();
    expect(sort.directionTrigger("col2")).toHaveTextContent(
      "Checked → unchecked",
    );
  });

  it("SortMenu_AddPanel_DisablesAlreadySortedProperties", async () => {
    const tableView = renderTableView();
    const sort = await tableView.openSortMenu();
    await sort.addRule("Name");
    await sort.startAdding();

    expect(sort.propertyOption("Name")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("SortMenu_SearchWithoutMatches_ShowsEmptyState", async () => {
    const tableView = renderTableView();
    const sort = await tableView.openSortMenu();
    await sort.startAdding();

    await sort.search("missing property");

    expect(screen.getByText("No results")).toBeVisible();
  });

  it("SortMenu_RemoveRule_RemovesNamedRule", async () => {
    const tableView = renderTableView();
    const sort = await tableView.openSortMenu();
    await sort.addRule("Name");

    await sort.remove("col1");

    expect(sort.queryDirection("A → Z")).not.toBeInTheDocument();
  });

  it("SortMenu_RemoveRuleFromMultipleRulesKeepsTheRemainingRule", async () => {
    const properties = createFullPluginFixture().properties.map((property) => ({
      ...property,
      icon: { type: "emoji" as const, src: "🔎" },
    }));
    const tableView = renderTableView({
      ...createFullPluginFixture(),
      properties,
    });
    const sort = await tableView.openSortMenu();
    await sort.addRule("Name");
    await sort.addRule("Complete");

    await sort.openDirection("complete", "Unchecked → checked");
    await tableView.user.click(sort.directionOption("Unchecked → checked"));

    await sort.remove("title");
    expect(sort.moveHandle("complete")).toBeVisible();

    await sort.startAdding();
    expect(sort.propertyOption("Score")).toBeVisible();
  });

  it("SortMenu_AddsALegacyPluginWithoutRegisteredSortingMetadata", async () => {
    const legacyPlugin: CellPlugin<"legacy", string, undefined> = {
      id: "legacy",
      meta: { name: "Legacy", desc: "Legacy", icon: null },
      default: { name: "Legacy", icon: null, config: undefined, data: "" },
      fromValue: (value) => String(value ?? ""),
      toValue: (value) => value,
      toTextValue: (value) => value,
      compare: () => 0,
      renderCellValue: ({ data }) => <span>{data}</span>,
    };
    const tableView = renderTableView({
      plugins: [...DEFAULT_PLUGINS, legacyPlugin],
      properties: [
        { id: "name", name: "Name", type: "title", config: { showIcon: true } },
        { id: "legacy", name: "Legacy", type: "legacy", config: undefined },
      ],
      data: [row("one", "One", "value")],
    });
    const sort = await tableView.openSortMenu();

    await sort.addRule("Name");
    await tableView.user.click(sort.propertyTrigger("name"));
    await tableView.user.click(
      await screen.findByRole("option", { name: "Legacy" }),
    );
    await sort.remove("legacy");
    await sort.addRule("Legacy");
    expect(sort.directionTrigger("legacy")).toHaveTextContent("Ascending");
  });

  it("SortMenu_UsesPluginDirectionLabelsAndKeepsOneMethodCompact", async () => {
    const tableView = renderTableView();
    const sort = await tableView.openSortMenu();

    await sort.addRule("Name");

    expect(sort.directionTrigger("col1")).toHaveTextContent("A → Z");
    expect(
      within(sort.root).queryByRole("combobox", { name: "Sort method" }),
    ).not.toBeInTheDocument();
    await tableView.user.click(sort.directionTrigger("col1"));
    expect(await screen.findByRole("option", { name: "Z → A" })).toBeVisible();
  });

  it("SortMenu_UsesNumberCheckboxAndDateDirectionLabels", async () => {
    const tableView = renderTableView(createFullPluginFixture());
    const sort = await tableView.openSortMenu();

    await sort.addRule("Score");
    expect(sort.directionTrigger("score")).toHaveTextContent("Low → high");
    await sort.addRule("Complete");
    expect(sort.directionTrigger("complete")).toHaveTextContent(
      "Checked → unchecked",
    );
    await sort.addRule("Due");
    expect(sort.directionTrigger("due")).toHaveTextContent("Old → new");
  });

  it("SortMenu_CustomRuntimePlugin_UsesDefaultSortingMethod", async () => {
    const customPlugin: CellPlugin<"priority-code", string, undefined> = {
      id: "priority-code",
      meta: { name: "Priority code", desc: "Priority code", icon: null },
      default: {
        name: "Priority code",
        icon: null,
        config: undefined,
        data: "",
      },
      fromValue: (value) => String(value ?? ""),
      toValue: (value) => value,
      toTextValue: (value) => value,
      sorting: {
        defaultMethod: "alphabetical",
        methods: [
          {
            id: "alphabetical",
            name: "Alphabetical",
            ascendingLabel: "A first",
            descendingLabel: "Z first",
            function: (rowA, rowB, colId) =>
              String(rowA.properties[colId]?.value ?? "").localeCompare(
                String(rowB.properties[colId]?.value ?? ""),
              ),
          },
          {
            id: "length",
            name: "Code length",
            ascendingLabel: "Short first",
            descendingLabel: "Long first",
            function: (rowA, rowB, colId) =>
              String(rowA.properties[colId]?.value ?? "").length -
              String(rowB.properties[colId]?.value ?? "").length,
          },
        ],
      },
      renderCellValue: ({ data }) => <span>{data}</span>,
    };
    const properties: ColumnInfo[] = [
      { id: "name", name: "Name", type: "title", config: { showIcon: true } },
      {
        id: "code",
        name: "Code",
        type: "priority-code",
        config: undefined,
      },
    ];
    const data: Row[] = [
      row("one", "One", "bbb"),
      row("two", "Two", "a"),
      row("three", "Three", "cc"),
    ];
    const tableView = renderTableView({
      plugins: [...DEFAULT_PLUGINS, customPlugin],
      properties,
      data,
    });
    const sort = await tableView.openSortMenu();

    await sort.addRule("Code");

    await waitFor(() =>
      expect(tableView.rowOrder(["One", "Two", "Three"])).toEqual([
        "Two",
        "One",
        "Three",
      ]),
    );
    expect(sort.directionTrigger("code")).toHaveTextContent("A first");
    expect(within(sort.root).getAllByRole("combobox")).toHaveLength(2);
  });
});

function row(id: string, name: string, code: string): Row {
  return {
    id,
    createdAt: 0,
    lastEditedAt: 0,
    properties: {
      name: { id: `${id}-name`, value: name },
      code: { id: `${id}-code`, value: code },
    },
  };
}
