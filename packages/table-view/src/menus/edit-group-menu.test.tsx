import { screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  CellPlugin,
  ColumnInfo,
  Row,
  TableViewState,
} from "@notion-kit/table-hook";

import { DEFAULT_PLUGINS } from "@/plugins";

import { renderTableView } from "../__tests__/component-objects/render-table-view";
import { createFullPluginFixture, mockResizeObserver } from "../__tests__/mock";

mockResizeObserver();

afterEach(() => {
  vi.restoreAllMocks();
});

async function openEditGroupingMenu() {
  const tableView = renderTableView();
  const settings = await tableView.openViewSettings();
  const selectGrouping = await settings.openSelectGrouping();
  return { tableView, grouping: await selectGrouping.select("Done") };
}

async function openTextGroupingMenu() {
  const tableView = renderTableView();
  const settings = await tableView.openViewSettings();
  const selectGrouping = await settings.openSelectGrouping();
  return { tableView, grouping: await selectGrouping.select("Name") };
}

async function openFixtureGroupingMenu(propertyName: string) {
  const tableView = renderTableView(createFullPluginFixture());
  const settings = await tableView.openViewSettings();
  const selectGrouping = await settings.openSelectGrouping();
  return { tableView, grouping: await selectGrouping.select(propertyName) };
}

describe("EditGroupMenu", () => {
  it("EditGroupingMenu_HideEmptyGroupsToggle_StaysOpen", async () => {
    const { grouping } = await openEditGroupingMenu();
    const initialState = grouping
      .hideEmptyGroupsItem()
      .getAttribute("aria-checked");

    await grouping.toggleHideEmptyGroups();

    expect(grouping.hideEmptyGroupsItem()).not.toHaveAttribute(
      "aria-checked",
      initialState,
    );
    expect(grouping.heading()).toBeVisible();
  });

  it("EditGroupingMenu_GroupVisibilityToggle_StaysOpen", async () => {
    const { grouping } = await openEditGroupingMenu();

    await grouping.toggleFirstGroupVisibility();

    expect(grouping.heading()).toBeVisible();
  });

  it("EditGroupingMenu_RemoveGrouping_ClearsSelection", async () => {
    const { tableView, grouping } = await openEditGroupingMenu();

    await grouping.removeGrouping();
    const settings = await tableView.openViewSettings();

    expect(settings.groupingSelection("Done")).toBe(false);
  });

  it("EditGroupingMenu_HelpAction_OpensDocumentedHelpTarget", async () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const { tableView, grouping } = await openEditGroupingMenu();

    await tableView.user.click(grouping.helpItem());

    expect(open).toHaveBeenCalledWith(
      "https://www.notion.com/help/boards#reorder-columns-&-cards",
      "_blank",
    );
  });

  it("EditGroupingMenu_ChangeGrouping_OpensSelection", async () => {
    const { grouping } = await openEditGroupingMenu();

    const selectGrouping = await grouping.changeGrouping();

    expect(selectGrouping.heading()).toBeVisible();
  });

  it("EditGroupingMenu_BackNavigation_ReturnsToViewSettings", async () => {
    const { grouping } = await openEditGroupingMenu();

    const settings = await grouping.backToViewSettings();

    expect(settings.heading("View Settings")).toBeVisible();
  });

  it("EditGroupingMenu_GroupUsingIsCapabilityDrivenAndPersistsSelection", async () => {
    const { tableView, grouping } = await openTextGroupingMenu();

    const groupUsing = within(grouping.root).getByRole("menuitem", {
      name: /Group using/,
    });
    expect(groupUsing).toHaveTextContent("Exact");
    await tableView.user.hover(groupUsing);
    const alphabetical = await screen.findByRole("menuitemradio", {
      name: "Alphabetical",
    });
    expect(alphabetical).toHaveAttribute("aria-checked", "false");
    await tableView.user.click(alphabetical);

    await waitFor(() => expect(groupUsing).toHaveTextContent("Alphabetical"));

    await waitFor(() =>
      expect(
        within(grouping.root).getByRole("menuitem", { name: "T" }),
      ).toBeVisible(),
    );
    expect(
      within(grouping.root).queryByRole("menuitem", { name: "Task 1" }),
    ).not.toBeInTheDocument();
  });

  it("EditGroupingMenu_OneGroupingMethodOmitsGroupUsing", async () => {
    const { grouping } = await openEditGroupingMenu();

    expect(
      within(grouping.root).queryByRole("menuitem", { name: /Group using/ }),
    ).not.toBeInTheDocument();
  });

  it.each([
    ["Score", ["Every 1", "Every 10", "Every 100", "Every 1000"]],
    ["Due", ["Relative", "Day", "Week", "Month", "Year"]],
  ])(
    "EditGroupingMenu_%sListsEveryRegisteredGroupingMethod",
    async (propertyName, expectedMethods) => {
      const { tableView, grouping } =
        await openFixtureGroupingMenu(propertyName);
      const groupUsing = within(grouping.root).getByRole("menuitem", {
        name: /Group using/,
      });

      await tableView.user.hover(groupUsing);
      await screen.findByRole("menuitemradio", { name: expectedMethods[0] });

      expect(
        screen.getAllByRole("menuitemradio").map((item) => item.textContent),
      ).toEqual(expectedMethods);
    },
  );

  it("EditGroupingMenu_SortGroupsUsesEligibleCapabilitiesAndCheckedState", async () => {
    const { tableView, grouping } = await openTextGroupingMenu();

    const sortGroups = within(grouping.root).getByRole("menuitem", {
      name: /Sort groups/,
    });
    expect(sortGroups).toHaveTextContent("Manual");
    await tableView.user.hover(sortGroups);
    expect(
      await screen.findByRole("menuitemradio", { name: "Manual" }),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("menuitemradio", { name: "A → Z" }),
    ).toHaveAttribute("aria-checked", "false");
    expect(
      screen.getByRole("menuitemradio", { name: "Z → A" }),
    ).toHaveAttribute("aria-checked", "false");

    await tableView.user.click(
      screen.getByRole("menuitemradio", { name: "Z → A" }),
    );
    await waitFor(() =>
      expect(
        screen
          .getAllByRole("group", { name: /^Group / })
          .map((group) => group.getAttribute("aria-label")),
      ).toEqual(["Group col1:Task 3", "Group col1:Task 1", "Group col1:"]),
    );
    expect(sortGroups).toHaveTextContent("Z → A");
  });

  it("EditGroupingMenu_CheckboxCapabilityOmitsAutomaticGroupSort", async () => {
    const { tableView, grouping } = await openEditGroupingMenu();

    const sortGroups = within(grouping.root).getByRole("menuitem", {
      name: /Sort groups/,
    });
    await tableView.user.hover(sortGroups);

    await screen.findByRole("menuitemradio", { name: "Manual" });
    expect(
      screen.getAllByRole("menuitemradio").map((item) => item.textContent),
    ).toEqual(["Manual"]);
  });

  it("EditGroupingMenu_ChangingToNonSortablePropertyResetsGroupSortToManual", async () => {
    const onViewChange = vi.fn();
    const tableView = renderTableView({ onViewChange });
    const settings = await tableView.openViewSettings();
    const selectGrouping = await settings.openSelectGrouping();
    const grouping = await selectGrouping.select("Name");
    const sortGroups = within(grouping.root).getByRole("menuitem", {
      name: /Sort groups/,
    });
    await tableView.user.hover(sortGroups);
    await tableView.user.click(
      await screen.findByRole("menuitemradio", { name: "Z → A" }),
    );

    const nextGrouping = await (await grouping.changeGrouping()).select("Done");
    await waitFor(() => {
      const viewChange = onViewChange.mock.lastCall?.[0] as
        | { next: TableViewState }
        | undefined;
      expect(viewChange?.next.pluginMethods?.groupSort).toEqual({
        mode: "manual",
      });
    });
    const nextSortGroups = within(nextGrouping.root).getByRole("menuitem", {
      name: /Sort groups/,
    });
    await tableView.user.hover(nextSortGroups);

    await waitFor(() =>
      expect(
        screen.getByRole("menuitemradio", { name: "Manual" }),
      ).toHaveAttribute("aria-checked", "true"),
    );
  });

  it("EditGroupingMenu_PreservesColonInSelectedGroupSortMethodId", async () => {
    const onViewChange = vi.fn();
    const plugin: CellPlugin<"colon-sort", string, undefined> = {
      id: "colon-sort",
      meta: { name: "Colon sort", desc: "Colon sort", icon: null },
      default: {
        name: "Colon sort",
        icon: null,
        config: undefined,
        data: "",
      },
      fromValue: (value) => String(value ?? ""),
      toValue: (value) => value,
      toTextValue: (value) => value,
      sorting: {
        defaultMethod: "locale",
        methods: [
          {
            id: "locale",
            name: "Locale",
            ascendingLabel: "Alphabetical first",
            descendingLabel: "Reverse alphabetical",
            toComparable: (value) => value,
            compare: (left, right) =>
              String(left).localeCompare(String(right)),
          },
          {
            id: "locale:casefold",
            name: "Casefold",
            ascendingLabel: "Shortest first",
            descendingLabel: "Longest first",
            toComparable: (value) => value,
            compare: (left, right) =>
              String(left).length - String(right).length,
          },
        ],
      },
      renderCell: ({ data }) => <span>{data}</span>,
    };
    const properties: ColumnInfo[] = [
      { id: "name", name: "Name", type: "title", config: { showIcon: true } },
      { id: "code", name: "Code", type: "colon-sort", config: undefined },
    ];
    const data = [
      colonSortRow("one", "One", "bbb"),
      colonSortRow("two", "Two", "a"),
      colonSortRow("three", "Three", "cc"),
    ];
    const tableView = renderTableView({
      plugins: [...DEFAULT_PLUGINS, plugin],
      properties,
      data,
      onViewChange,
    });
    const settings = await tableView.openViewSettings();
    const selectGrouping = await settings.openSelectGrouping();
    const grouping = await selectGrouping.select("Code");
    const sortGroups = within(grouping.root).getByRole("menuitem", {
      name: /Sort groups/,
    });
    await tableView.user.hover(sortGroups);
    await tableView.user.click(
      await screen.findByRole("menuitemradio", { name: "Shortest first" }),
    );

    await waitFor(() =>
      expect(
        screen
          .getAllByRole("group", { name: /^Group / })
          .map((group) => group.getAttribute("aria-label")),
      ).toEqual(["Group code:a", "Group code:cc", "Group code:bbb"]),
    );
    const viewChange = onViewChange.mock.lastCall?.[0] as
      | { next: TableViewState }
      | undefined;
    expect(viewChange?.next.pluginMethods?.groupSort).toEqual({
      mode: "automatic",
      method: "locale:casefold",
      desc: false,
    });
  });
});

function colonSortRow(id: string, name: string, code: string): Row {
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
