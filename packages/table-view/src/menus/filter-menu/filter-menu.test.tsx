import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import { addDays, format } from "date-fns";
import { describe, expect, it, vi } from "vitest";

import type {
  ColumnInfo,
  FilterGroup,
  ResourceChange,
  TableViewState,
} from "@notion-kit/table-hook";
import type {
  CellPlugin,
  FilterOperandMetadata,
} from "@notion-kit/table-hook/plugins";
import type { Color } from "@notion-kit/utils";
import { isoToTs } from "@notion-kit/utils";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { FilterMenuObject } from "@/__tests__/component-objects/table-view";
import { createFullPluginFixture, mockResizeObserver } from "@/__tests__/mock";
import { TableViewWrapper } from "@/table-contexts";

import { FilterMenu } from ".";

mockResizeObserver();

const seeded = (children: FilterGroup["children"], logic = "and" as const) =>
  ({ kind: "group", id: "root", logic, children }) satisfies FilterGroup;
const rule = (id: string, propertyId = "name", operator = "contains") =>
  ({ kind: "rule", id, propertyId, operator }) as const;
type ViewChangeMock = ReturnType<
  typeof vi.fn<(change: ResourceChange<TableViewState, unknown>) => void>
>;

function renderFilterMenu(options: {
  filters?: FilterGroup | null;
  onViewChange?: (change: ResourceChange<TableViewState, unknown>) => void;
  plugins?: CellPlugin[];
  properties?: ColumnInfo[];
  withTitle?: boolean;
}) {
  const titleFixture = options.withTitle
    ? createFullPluginFixture()
    : undefined;
  return renderTableView({
    view: { filters: options.filters },
    onViewChange: options.onViewChange,
    plugins: options.plugins,
    data: titleFixture?.data,
    properties: options.properties ?? titleFixture?.properties,
    children: <FilterMenu />,
  });
}

describe("FilterMenu", () => {
  it("selects a property, operator, and commits a text operand on blur", async () => {
    const onViewChange =
      vi.fn<(change: ResourceChange<TableViewState, unknown>) => void>();
    const tableView = renderFilterMenu({
      filters: seeded([
        { ...rule("rule-1", "done", "is-checked"), value: "stale" },
      ]),
      onViewChange,
    });
    const filter = tableView.filterMenu();

    await filter.chooseProperty("rule-1", "Name");
    expect(lastRule(onViewChange)).toMatchObject({
      propertyId: "col1",
      operator: "equals",
    });
    expect(lastRule(onViewChange)).not.toHaveProperty("value");
    onViewChange.mockClear();
    await filter.chooseOperator("rule-1", "Contains");
    expect(lastRule(onViewChange)).not.toHaveProperty("value");
    await tableView.user.type(filter.operand("rule-1"), "alpha");
    expect(onViewChange).toHaveBeenCalledTimes(1);
    await tableView.user.tab();

    expect(lastRule(onViewChange)).toMatchObject({
      propertyId: "col1",
      operator: "contains",
      value: "alpha",
    });
  });

  it("edits nested groups, enforces three levels, and deletes rules and groups", async () => {
    const filters = seeded([
      rule("root-rule"),
      {
        kind: "group",
        id: "level-2",
        logic: "and",
        children: [
          rule("nested-rule"),
          {
            kind: "group",
            id: "level-3",
            logic: "and",
            children: [rule("deep-rule")],
          },
        ],
      },
    ]);
    const tableView = renderFilterMenu({ filters });
    const filter = tableView.filterMenu();

    await filter.chooseLogic("level-2", "Or");
    expect(filter.logic("level-2")).toHaveTextContent("Or");
    expect(filter.addRule("level-3")).toHaveAttribute("aria-disabled", "true");

    await filter.deleteNode("nested-rule");
    expect(
      screen.queryByTestId("filter-rule-nested-rule"),
    ).not.toBeInTheDocument();
    await filter.deleteNode("level-3");
    expect(
      screen.queryByTestId("filter-group-level-3"),
    ).not.toBeInTheDocument();
  });

  it("clears the root from Delete filter and when its final rule is removed", async () => {
    const onViewChange =
      vi.fn<(change: ResourceChange<TableViewState, unknown>) => void>();
    const tableView = renderFilterMenu({
      filters: seeded([rule("only", "title", "equals")]),
      onViewChange,
      withTitle: true,
    });
    const filter = tableView.filterMenu();
    await filter.deleteNode("only");
    await waitFor(() => expect(onViewChange).toHaveBeenCalledOnce());
    expect(onViewChange.mock.lastCall![0].next.filters).toBeNull();
    expect(screen.queryByTestId("filter-group-root")).not.toBeInTheDocument();

    cleanup();
    const secondOnViewChange =
      vi.fn<(change: ResourceChange<TableViewState, unknown>) => void>();
    const second = renderFilterMenu({
      filters: seeded([rule("again", "title", "equals")]),
      onViewChange: secondOnViewChange,
      withTitle: true,
    });
    await second.filterMenu().deleteFilter();
    await waitFor(() => expect(secondOnViewChange).toHaveBeenCalledOnce());
    expect(secondOnViewChange.mock.lastCall![0].next.filters).toBeNull();
    expect(screen.queryByTestId("filter-rule-again")).not.toBeInTheDocument();
    expect(second.filterMenu().emptyAddRule()).toBeVisible();
  });

  it("shows an unavailable stored property without throwing and keeps it deletable", async () => {
    const tableView = renderFilterMenu({
      filters: seeded([rule("missing", "removed-property", "old-op")]),
    });
    const filter = tableView.filterMenu();
    expect(filter.property("missing")).toHaveTextContent(
      "removed-property (unavailable)",
    );
    await filter.deleteNode("missing");
    expect(
      screen.queryByText("removed-property (unavailable)"),
    ).not.toBeInTheDocument();
  });

  it("excludes deleted and unsupported properties when replacing a rule property", async () => {
    const supported = metadataPlugin("text", "text-op");
    const unsupported: CellPlugin<"unsupported", string, undefined> = {
      id: "unsupported",
      meta: { name: "Unsupported", desc: "Unsupported", icon: null },
      default: { name: "Unsupported", icon: null, data: "", config: undefined },
      fromValue: String,
      toValue: (value) => value,
      toTextValue: (value) => value,
      isEmpty: (value) => value.trim() === "",
      renderCellValue: () => null,
    };
    const tableView = renderFilterMenu({
      filters: seeded([rule("live-rule", "live", "text-op")]),
      plugins: [supported, unsupported],
      properties: [
        metadataProperty("live", "Live"),
        { ...metadataProperty("deleted", "Deleted"), isDeleted: true },
        {
          id: "unsupported",
          name: "Unsupported",
          type: "unsupported",
          config: undefined,
        },
      ],
    });

    await tableView.user.click(tableView.filterMenu().property("live-rule"));

    expect(await screen.findByRole("option", { name: "Live" })).toBeVisible();
    expect(screen.queryByRole("option", { name: "Deleted" })).toBeNull();
    expect(screen.queryByRole("option", { name: "Unsupported" })).toBeNull();
  });

  it("creates the default title rule only after Add filter rule is selected", async () => {
    const onViewChange =
      vi.fn<(change: ResourceChange<TableViewState, unknown>) => void>();
    const tableView = renderFilterMenu({
      filters: null,
      onViewChange,
      withTitle: true,
    });

    expect(onViewChange).not.toHaveBeenCalled();
    expect(screen.queryByTestId("filter-group-root")).not.toBeInTheDocument();
    await tableView.filterMenu().openEmptyAddMenu();
    await tableView.user.click(
      await tableView.filterMenu().addMenuItem("Add filter rule"),
    );
    await waitFor(() => expect(onViewChange).toHaveBeenCalledOnce());
    expect(onViewChange.mock.lastCall![0].next.filters).toMatchObject({
      children: [{ propertyId: "title", operator: "equals" }],
    });
  });

  it("keeps an authoritative empty root unchanged", () => {
    const onViewChange =
      vi.fn<(change: ResourceChange<TableViewState, unknown>) => void>();
    const tableView = renderFilterMenu({
      filters: seeded([]),
      onViewChange,
      withTitle: true,
    });

    expect(tableView.filterMenu().group("root")).toBeVisible();
    expect(onViewChange).not.toHaveBeenCalled();
  });

  it("preserves authoritative root metadata and nested empty groups without implicit selection", () => {
    const onViewChange =
      vi.fn<(change: ResourceChange<TableViewState, unknown>) => void>();
    const nestedEmpty = {
      kind: "group" as const,
      id: "nested-empty",
      logic: "and" as const,
      children: [],
    };
    const tableView = renderFilterMenu({
      filters: {
        kind: "group",
        id: "authoritative-root",
        logic: "or",
        children: [nestedEmpty],
      },
      onViewChange,
      withTitle: true,
    });
    const filter = tableView.filterMenu();
    expect(filter.group("nested-empty")).toBeVisible();

    expect(onViewChange).not.toHaveBeenCalled();
  });

  it("keeps zero-rule nested groups visible and deletable", async () => {
    const onViewChange =
      vi.fn<(change: ResourceChange<TableViewState, unknown>) => void>();
    const retained = {
      kind: "group" as const,
      id: "nested-retained",
      logic: "or" as const,
      children: [],
    };
    const tableView = renderFilterMenu({
      filters: {
        kind: "group",
        id: "authoritative-root",
        logic: "and",
        children: [
          {
            kind: "group",
            id: "nested-delete",
            logic: "and",
            children: [],
          },
          retained,
        ],
      },
      onViewChange,
      withTitle: true,
    });
    const filter = tableView.filterMenu();
    expect(filter.group("nested-delete")).toBeVisible();
    expect(filter.group("nested-retained")).toBeVisible();
    await filter.deleteNode("nested-delete");

    const filters = onViewChange.mock.lastCall![0].next.filters!;
    expect(filters).toMatchObject({
      id: "authoritative-root",
      logic: "and",
    });
    expect(filters.children[0]).toEqual(retained);
    expect(filters.children).toHaveLength(1);
    expect(
      screen.queryByTestId("filter-group-nested-delete"),
    ).not.toBeInTheDocument();
    expect(filter.group("nested-retained")).toBeVisible();
  });

  it("adds the title rule from Add filter rule", async () => {
    const onViewChange =
      vi.fn<(change: ResourceChange<TableViewState, unknown>) => void>();
    const tableView = renderFilterMenu({
      filters: seeded([rule("existing")]),
      onViewChange,
      withTitle: true,
    });
    const filter = tableView.filterMenu();

    await filter.openAddMenu("root");
    await tableView.user.click(await filter.addMenuItem("Add filter rule"));
    await waitFor(() => expect(onViewChange).toHaveBeenCalledOnce());
    expect(onViewChange.mock.lastCall![0].next.filters!.children).toHaveLength(
      2,
    );
    expect(
      onViewChange.mock.lastCall![0].next.filters!.children[1],
    ).toMatchObject({
      propertyId: "title",
      operator: "equals",
    });
  });

  it("adds and retains an empty nested group from the shared add menu", async () => {
    const onViewChange =
      vi.fn<(change: ResourceChange<TableViewState, unknown>) => void>();
    const tableView = renderFilterMenu({
      filters: seeded([rule("existing")]),
      onViewChange,
    });
    const filter = tableView.filterMenu();

    await filter.openAddMenu("root");
    await tableView.user.click(await filter.addMenuItem("Add filter group"));

    const filters = onViewChange.mock.lastCall![0].next.filters!;
    expect(filters.children[1]).toMatchObject({
      kind: "group",
      logic: "and",
      children: [],
    });
    expect(screen.getAllByTestId(/filter-group-/)).toHaveLength(2);
  });

  it("retains an empty nested group when adding a rule beside an active sibling", async () => {
    const onViewChange =
      vi.fn<(change: ResourceChange<TableViewState, unknown>) => void>();
    const nestedEmpty = {
      kind: "group" as const,
      id: "nested-empty",
      logic: "or" as const,
      children: [],
    };
    const tableView = renderFilterMenu({
      filters: seeded([rule("existing"), nestedEmpty]),
      onViewChange,
      withTitle: true,
    });
    const filter = tableView.filterMenu();

    await filter.openAddMenu("root");
    await tableView.user.click(await filter.addMenuItem("Add filter rule"));

    const filters = onViewChange.mock.lastCall![0].next.filters!;
    expect(filters.children[1]).toEqual(nestedEmpty);
    expect(filters.children[2]).toMatchObject({
      kind: "rule",
      propertyId: "title",
    });
  });

  it("adds a nested group when no filterable properties are available", async () => {
    const onViewChange =
      vi.fn<(change: ResourceChange<TableViewState, unknown>) => void>();
    const tableView = renderFilterMenu({
      filters: seeded([rule("unavailable", "missing", "missing-op")]),
      onViewChange,
      plugins: [],
      properties: [],
    });
    const filter = tableView.filterMenu();

    expect(filter.addRule("root")).toBeEnabled();
    await filter.openAddMenu("root");
    expect(
      screen.queryByRole("menuitem", { name: "Add filter rule" }),
    ).not.toBeInTheDocument();
    await tableView.user.click(await filter.addMenuItem("Add filter group"));

    expect(
      onViewChange.mock.lastCall![0].next.filters!.children[1],
    ).toMatchObject({ kind: "group", logic: "and", children: [] });
  });

  it("only lets the first later child at each depth change the shared logic", async () => {
    const tableView = renderFilterMenu({
      filters: seeded([
        rule("first"),
        rule("second"),
        rule("third"),
        {
          kind: "group",
          id: "nested",
          logic: "and",
          children: [
            rule("nested-first"),
            rule("nested-second"),
            rule("nested-third"),
          ],
        },
      ]),
    });
    const filter = tableView.filterMenu();

    expect(within(filter.rule("first")).getByText("Where")).toBeVisible();
    expect(within(filter.rule("second")).getByText("And")).toBeVisible();
    expect(within(filter.rule("third")).getByText("And")).toBeVisible();
    expect(
      within(filter.rule("nested-first")).getByText("Where"),
    ).toBeVisible();
    expect(within(filter.rule("nested-second")).getByText("And")).toBeVisible();
    expect(within(filter.rule("nested-third")).getByText("And")).toBeVisible();

    expect(filter.logic("second")).toBeVisible();
    expect(filter.logic("nested-second")).toBeVisible();
    expect(
      within(filter.rule("third")).queryByRole("combobox", {
        name: "Filter logic select",
      }),
    ).toBeNull();
    expect(
      within(filter.rule("nested-third")).queryByRole("combobox", {
        name: "Filter logic select",
      }),
    ).toBeNull();

    await tableView.user.click(filter.logic("second"));
    await tableView.user.click(
      await screen.findByRole("option", { name: "Or" }),
    );
    expect(filter.logic("second")).toHaveTextContent("Or");
    expect(within(filter.rule("third")).getByText("Or")).toBeVisible();
  });

  it("shows only Delete in rule and nested-group action menus", async () => {
    const tableView = renderFilterMenu({
      filters: seeded([
        rule("existing"),
        { kind: "group", id: "nested", logic: "and", children: [] },
      ]),
    });
    const filter = tableView.filterMenu();

    for (const id of ["existing", "nested"]) {
      await tableView.user.click(filter.actions(id));
      expect(
        await screen.findByRole("menuitem", { name: "Delete" }),
      ).toBeVisible();
      await tableView.user.keyboard("{Escape}");
    }
  });

  it("keeps view mode on an existing tree out of property selection", () => {
    const tableView = renderFilterMenu({ filters: seeded([rule("existing")]) });
    const filter = tableView.filterMenu();

    expect(within(filter.group("root")).getAllByRole("combobox")).toHaveLength(
      2,
    );
  });
});

const operandKinds = [
  ["text", "text-op", "hello", "hello"],
  ["number", "number-op", "42.5", 42.5],
] as const;

describe("FilterMenu operand metadata", () => {
  it.each(operandKinds)(
    "persists %s operands exactly",
    async (kind, operator, input, expected) => {
      const { tableView, onViewChange } = renderMetadataMenu(kind, operator);
      await tableView.user.type(
        tableView.filterMenu().operand("operand-rule"),
        input,
      );
      expect(onViewChange).not.toHaveBeenCalled();
      await tableView.user.tab();
      expect(lastValue(onViewChange)).toEqual(expected);
    },
  );

  it("persists configured option names", async () => {
    const { tableView, onViewChange } = renderMetadataMenu(
      "option",
      "option-op",
    );
    await tableView.user.click(
      tableView.filterMenu().selectOperand("operand-rule"),
    );
    await tableView.user.click(
      await screen.findByRole("option", { name: "Beta" }, { timeout: 5_000 }),
    );
    expect(lastValue(onViewChange)).toBe("Beta");
  });

  it("persists every selected multi-option operand", async () => {
    const { tableView, onViewChange } = renderMetadataMenu(
      { kind: "option", multiple: true },
      "option-op",
    );
    const filter = tableView.filterMenu();

    await tableView.user.click(filter.selectOperand("operand-rule"));
    await tableView.user.click(
      await screen.findByRole("option", { name: "Alpha" }),
    );
    expect(
      screen.getByRole("combobox", { name: "Search options" }),
    ).toBeVisible();
    await tableView.user.click(
      await screen.findByRole("option", { name: "Beta" }),
    );

    expect(lastValue(onViewChange)).toEqual(["Alpha", "Beta"]);
    await tableView.user.click(filter.rule("operand-rule"));
    expect(filter.selectOperand("operand-rule")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("shows a compact multi-option trigger and exposes chips only in its popup", async () => {
    const { tableView } = renderMetadataMenu(
      { kind: "option", multiple: true },
      "option-op",
      { value: ["Alpha", "Beta"] },
    );
    const filter = tableView.filterMenu();

    expect(filter.selectOperand("operand-rule")).toHaveTextContent("Alpha");
    expect(filter.selectOperand("operand-rule")).toHaveTextContent("+1");
    expect(
      screen.queryByRole("combobox", { name: "Search options" }),
    ).not.toBeInTheDocument();

    await tableView.user.click(filter.selectOperand("operand-rule"));

    expect(
      await screen.findByRole("combobox", { name: "Search options" }),
    ).toBeVisible();
    expect(screen.getAllByRole("button", { name: "Remove" })).toHaveLength(2);
  });

  it("reveals the custom date picker only after selecting Custom date", async () => {
    const { tableView, onViewChange } = renderMetadataMenu("date", "date-op");
    const filter = tableView.filterMenu();

    expect(filter.rule("operand-rule")).not.toHaveTextContent("YYYY-MM-DD");
    await tableView.user.click(filter.datePreset("operand-rule"));
    await tableView.user.click(
      await screen.findByRole("option", { name: "Custom date" }),
    );
    await tableView.user.click(filter.customDate("operand-rule"));
    const today = new Date();
    await tableView.user.click(
      await screen.findByRole("button", { name: /Today/ }),
    );

    expect(lastValue(onViewChange)).toEqual({
      timestamp: Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      ),
    });
  });

  it("persists signed relative date amounts with their calendar unit", async () => {
    const { tableView, onViewChange } = renderMetadataMenu(
      "relative-date",
      "relative-op",
    );
    const filter = tableView.filterMenu();

    await tableView.user.type(filter.relativeDateAmount("operand-rule"), "-2");
    await tableView.user.click(filter.relativeDateUnit("operand-rule"));
    await tableView.user.click(
      await screen.findByRole("option", { name: "Week" }),
    );

    expect(lastValue(onViewChange)).toEqual({ amount: -2, unit: "week" });
  });

  it("persists a typed range only when both dates are complete and ordered", async () => {
    const range = renderMetadataMenu("date-range", "range-op");
    const filter = range.tableView.filterMenu();

    await range.tableView.user.click(filter.dateRange("operand-rule"));
    const start = await screen.findByRole("textbox", { name: "Starting" });
    const end = screen.getByRole("textbox", { name: "Ending" });
    await range.tableView.user.type(start, "2026-08-26");
    expect(range.onViewChange).not.toHaveBeenCalled();
    await range.tableView.user.type(end, "2026-08-27");
    expect(range.onViewChange).not.toHaveBeenCalled();
    await range.tableView.user.tab();
    const value = lastValue(range.onViewChange) as {
      start: number;
      end: number;
    };
    expect(dateValue(value.start)).toBe("2026-08-26");
    expect(dateValue(value.end)).toBe("2026-08-27");
  });

  it("omits values for none and does not persist invalid or incomplete operands", async () => {
    const none = renderMetadataMenu("text", "text-op", { value: "stale" });
    await none.tableView.filterMenu().chooseOperator("operand-rule", "None op");
    expect(lastRule(none.onViewChange)).not.toHaveProperty("value");
    expect(
      within(none.tableView.filterMenu().rule("operand-rule")).queryByRole(
        "textbox",
      ),
    ).not.toBeInTheDocument();

    cleanup();
    const number = renderMetadataMenu("number", "number-op");
    await number.tableView.user.type(
      number.tableView.filterMenu().operand("operand-rule"),
      "1",
    );
    expect(number.onViewChange).not.toHaveBeenCalled();
    await number.tableView.user.tab();
    expect(lastValue(number.onViewChange)).toBe(1);
    number.onViewChange.mockClear();
    await number.tableView.user.type(
      number.tableView.filterMenu().operand("operand-rule"),
      "e",
    );
    await number.tableView.user.tab();
    expect(number.onViewChange).not.toHaveBeenCalled();

    cleanup();
    const relative = renderMetadataMenu("relative-date", "relative-op");
    await relative.tableView.user.type(
      relative.tableView.filterMenu().relativeDateAmount("operand-rule"),
      "1",
    );
    expect(relative.onViewChange).not.toHaveBeenCalled();
    await relative.tableView.user.tab();
    expect(lastValue(relative.onViewChange)).toEqual({
      amount: 1,
      unit: "day",
    });
    relative.onViewChange.mockClear();
    await relative.tableView.user.type(
      relative.tableView.filterMenu().relativeDateAmount("operand-rule"),
      ".5",
    );
    await relative.tableView.user.tab();
    expect(relative.onViewChange).not.toHaveBeenCalled();
  });

  it("omits a relative-date operand when its amount is cleared", async () => {
    const relative = renderMetadataMenu("relative-date", "relative-op", {
      value: { amount: 2, unit: "day" },
    });
    const amount = relative.tableView
      .filterMenu()
      .relativeDateAmount("operand-rule");

    await relative.tableView.user.clear(amount);
    await relative.tableView.user.tab();

    expect(lastRule(relative.onViewChange)).not.toHaveProperty("value");
  });

  it("selects a point date from Calendar in the configured timezone", async () => {
    const selected = isoToTs(
      { date: "2026-08-26", time: "00:00:00" },
      "America/Los_Angeles",
    );
    const date = renderMetadataMenu(
      "date",
      "date-op",
      { value: { timestamp: selected } },
      {
        tz: "America/Los_Angeles",
      },
    );
    await date.tableView.user.click(
      date.tableView.filterMenu().customDate("operand-rule"),
    );
    const tomorrow = addDays(new Date(), 1);
    await date.tableView.user.click(
      await screen.findByRole("button", {
        name: format(tomorrow, "EEEE, MMMM do, yyyy"),
      }),
    );

    expect(lastValue(date.onViewChange)).toEqual({
      timestamp: isoToTs(
        { date: format(tomorrow, "yyyy-MM-dd"), time: "00:00:00" },
        "America/Los_Angeles",
      ),
    });
  });

  it("selects a complete date range from one range picker", async () => {
    const range = renderMetadataMenu("date-range", "range-op");
    const filter = range.tableView.filterMenu();

    await range.tableView.user.click(filter.dateRange("operand-rule"));
    const today = new Date();
    const tomorrow = addDays(today, 1);
    await range.tableView.user.click(
      await screen.findByRole("button", { name: /Today/ }),
    );
    expect(range.onViewChange).not.toHaveBeenCalled();
    await range.tableView.user.click(
      await screen.findByRole("button", {
        name: format(tomorrow, "EEEE, MMMM do, yyyy"),
      }),
    );

    expect(lastValue(range.onViewChange)).toEqual({
      start: Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
      end: Date.UTC(
        tomorrow.getFullYear(),
        tomorrow.getMonth(),
        tomorrow.getDate(),
      ),
    });
  });

  it("persists and renders pre-1970 dates in a non-UTC timezone", async () => {
    const timeZone = "America/Los_Angeles";
    const date = renderMetadataMenu(
      "date",
      "date-op",
      {
        value: {
          timestamp: isoToTs(
            { date: "1960-01-01", time: "00:00:00" },
            timeZone,
          ),
        },
      },
      {
        tz: timeZone,
      },
    );
    const operand = date.tableView.filterMenu().customDate("operand-rule");
    expect(operand).toHaveTextContent("1960-01-01");

    await date.tableView.user.click(operand);
    const input = await screen.findByRole("textbox", {
      name: "Custom date input",
    });
    await date.tableView.user.clear(input);
    await date.tableView.user.type(input, "1960-01-02");
    await date.tableView.user.tab();

    expect(lastValue(date.onViewChange)).toEqual({
      timestamp: isoToTs({ date: "1960-01-02", time: "00:00:00" }, timeZone),
    });
  });

  it("uses the configured timezone for typed dates", async () => {
    const date = renderMetadataMenu("date", "date-op", undefined, {
      tz: "America/Los_Angeles",
    });
    await date.tableView.user.click(
      date.tableView.filterMenu().datePreset("operand-rule"),
    );
    await date.tableView.user.click(
      await screen.findByRole("option", { name: "Custom date" }),
    );
    await date.tableView.user.click(
      date.tableView.filterMenu().customDate("operand-rule"),
    );
    await date.tableView.user.type(
      await screen.findByRole("textbox", { name: "Custom date input" }),
      "2026-08-26",
    );
    await date.tableView.user.tab();

    expect(lastValue(date.onViewChange)).toEqual({
      timestamp: isoToTs(
        { date: "2026-08-26", time: "00:00:00" },
        "America/Los_Angeles",
      ),
    });
  });

  it("resyncs date inputs when only timezone changes", async () => {
    const timestamp = Date.UTC(2026, 7, 26, 6);
    const date = renderControlledMetadata(
      "date",
      "date-op",
      { timestamp },
      { tz: "UTC" },
    );
    expect(date.filter.customDate("operand-rule")).toHaveTextContent(
      "2026-08-26",
    );
    date.rerenderTimeZone("America/Los_Angeles");
    expect(date.filter.customDate("operand-rule")).toHaveTextContent(
      "2026-08-25",
    );
    await date.user.click(date.filter.customDate("operand-rule"));
    expect(
      await screen.findByRole("textbox", { name: "Custom date input" }),
    ).toHaveValue("2026-08-25");

    cleanup();
    const range = renderControlledMetadata(
      "date-range",
      "range-op",
      { start: timestamp, end: Date.UTC(2026, 7, 27, 6) },
      { tz: "UTC" },
    );
    range.rerenderTimeZone("America/Los_Angeles");
    await range.user.click(range.filter.dateRange("operand-rule"));
    expect(
      await screen.findByRole("textbox", { name: "Starting" }),
    ).toHaveValue("2026-08-25");
    expect(screen.getByRole("textbox", { name: "Ending" })).toHaveValue(
      "2026-08-26",
    );
  });

  it("rejects invalid, incomplete, and reversed date ranges", async () => {
    const range = renderMetadataMenu("date-range", "range-op");
    const filter = range.tableView.filterMenu();
    await range.tableView.user.click(filter.dateRange("operand-rule"));
    const start = await screen.findByRole("textbox", { name: "Starting" });
    const end = screen.getByRole("textbox", { name: "Ending" });
    await range.tableView.user.type(start, "2026-08-27");
    await range.tableView.user.tab();
    await range.tableView.user.type(end, "invalid");
    await range.tableView.user.tab();
    expect(range.onViewChange).not.toHaveBeenCalled();

    await range.tableView.user.clear(end);
    await range.tableView.user.type(end, "2026-08-26");
    await range.tableView.user.tab();
    expect(range.onViewChange).not.toHaveBeenCalled();
  });

  it("restores a controlled owner's rejected numeric value", async () => {
    const controlled = renderControlledMetadata("number", "number-op", 7);
    const operand = controlled.filter.operand("operand-rule");

    await controlled.user.type(operand, "9", {
      initialSelectionStart: 0,
      initialSelectionEnd: 1,
    });
    await controlled.user.tab();

    expect(lastValue(controlled.onViewChange)).toBe(9);
    expect(operand).toHaveValue("7");
  });

  it("resyncs same-operator external date and relative values", () => {
    const first = isoToTs(
      { date: "2026-08-26", time: "00:00:00" },
      "America/Los_Angeles",
    );
    const second = isoToTs(
      { date: "2026-08-27", time: "00:00:00" },
      "America/Los_Angeles",
    );
    const date = renderControlledMetadata(
      "date",
      "date-op",
      { timestamp: first },
      { tz: "America/Los_Angeles" },
    );
    expect(date.filter.customDate("operand-rule")).toHaveTextContent(
      "2026-08-26",
    );
    date.rerenderValue({ timestamp: second });
    expect(date.filter.customDate("operand-rule")).toHaveTextContent(
      "2026-08-27",
    );

    cleanup();
    const relative = renderControlledMetadata("relative-date", "relative-op", {
      amount: 2,
      unit: "day",
    });
    expect(relative.filter.relativeDateAmount("operand-rule")).toHaveValue("2");
    relative.rerenderValue({ amount: -4, unit: "week" });
    expect(relative.filter.relativeDateAmount("operand-rule")).toHaveValue(
      "-4",
    );
    expect(relative.filter.relativeDateUnit("operand-rule")).toHaveTextContent(
      "Week",
    );
  });

  it("does not offer a rule when the table has no title property", async () => {
    const supported = metadataPlugin("text", "text-op");
    const unsupported: CellPlugin<"unsupported", string, undefined> = {
      id: "unsupported",
      meta: { name: "Unsupported", desc: "Unsupported", icon: null },
      default: { name: "Unsupported", icon: null, data: "", config: undefined },
      fromValue: String,
      toValue: (value) => value,
      toTextValue: (value) => value,
      isEmpty: (value) => value.trim() === "",
      renderCellValue: () => null,
    };
    const tableView = renderFilterMenu({
      filters: null,
      plugins: [supported, unsupported],
      properties: [
        metadataProperty("live", "Live"),
        { ...metadataProperty("deleted", "Deleted"), isDeleted: true },
        {
          id: "unsupported",
          name: "Unsupported",
          type: "unsupported",
          config: undefined,
        },
      ],
    });

    await tableView.filterMenu().openEmptyAddMenu();
    expect(
      await screen.findByRole("menuitem", { name: "Add filter group" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("menuitem", { name: "Add filter rule" }),
    ).not.toBeInTheDocument();
  });
});

function renderMetadataMenu(
  metadata: FilterOperandMetadata["kind"] | FilterOperandMetadata,
  operator: string,
  existing?: { value: import("@notion-kit/table-hook").FilterValue },
  configOverrides?: { tz?: string },
) {
  const onViewChange =
    vi.fn<(change: ResourceChange<TableViewState, unknown>) => void>();
  const tableView = renderFilterMenu({
    filters: seeded([
      { ...rule("operand-rule", "metadata", operator), ...existing },
    ]),
    onViewChange,
    plugins: [metadataPlugin(metadata, operator)],
    properties: [metadataProperty("metadata", "Metadata", configOverrides)],
  });
  return { tableView, onViewChange };
}

interface MetadataConfig {
  options: {
    names: string[];
    items: Record<string, { name: string; color: Color }>;
  };
  tz?: string;
}
type MetadataPlugin = CellPlugin<"metadata", string, MetadataConfig>;

function metadataPlugin(
  metadata: FilterOperandMetadata["kind"] | FilterOperandMetadata,
  operator: string,
): MetadataPlugin {
  const operand = typeof metadata === "string" ? { kind: metadata } : metadata;
  return {
    id: "metadata",
    meta: { name: "Metadata", desc: "Metadata", icon: null },
    default: {
      name: "Metadata",
      icon: null,
      data: "",
      config: { options: { names: [], items: {} } },
    },
    fromValue: String,
    toValue: (value) => value,
    toTextValue: (value) => value,
    isEmpty: (value) => value.trim() === "",
    filtering: {
      operators: [
        {
          id: operator,
          name: operator,
          operand,
          matches: () => false,
        },
        ...(operand.kind === "none"
          ? []
          : [
              {
                id: "none-op",
                name: "None op",
                operand: { kind: "none" as const },
                matches: () => false,
              },
            ]),
      ],
    },
    renderCellValue: () => null,
  };
}

function metadataProperty(
  id: string,
  name: string,
  overrides?: { tz?: string },
): ColumnInfo<MetadataPlugin> {
  return {
    id,
    name,
    type: "metadata",
    config: {
      options: {
        names: ["Alpha", "Beta"],
        items: {
          Alpha: { name: "Alpha", color: "blue" },
          Beta: { name: "Beta", color: "green" },
        },
      },
      ...overrides,
    },
  };
}

function renderControlledMetadata(
  kind: FilterOperandMetadata["kind"],
  operator: string,
  value: import("@notion-kit/table-hook").FilterValue,
  configOverrides?: { tz?: string },
) {
  const user = userEvent.setup({
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  });
  const onViewChange =
    vi.fn<(change: ResourceChange<TableViewState, unknown>) => void>();
  const plugin = metadataPlugin(kind, operator);
  let currentValue = value;
  let currentTimeZone = configOverrides?.tz;
  const makeFilters = (
    nextValue: import("@notion-kit/table-hook").FilterValue,
  ) =>
    seeded([
      { ...rule("operand-rule", "metadata", operator), value: nextValue },
    ]);
  const Controlled = ({
    nextValue,
    timeZone,
  }: {
    nextValue: import("@notion-kit/table-hook").FilterValue;
    timeZone?: string;
  }) => (
    <TableViewWrapper
      plugins={[plugin]}
      data={[]}
      properties={[metadataProperty("metadata", "Metadata", { tz: timeZone })]}
      view={{ filters: makeFilters(nextValue) }}
      onViewChange={onViewChange}
    >
      <FilterMenu />
    </TableViewWrapper>
  );
  const rendered = render(
    <Controlled nextValue={currentValue} timeZone={currentTimeZone} />,
  );
  const rerender = () =>
    rendered.rerender(
      <Controlled nextValue={currentValue} timeZone={currentTimeZone} />,
    );
  const filter = new FilterMenuObject(user);
  return {
    user,
    filter,
    onViewChange,
    rerenderValue(nextValue: import("@notion-kit/table-hook").FilterValue) {
      currentValue = nextValue;
      rerender();
    },
    rerenderTimeZone(timeZone: string) {
      currentTimeZone = timeZone;
      rerender();
    },
  };
}

function lastRule(onViewChange: ViewChangeMock) {
  const filters = onViewChange.mock.lastCall![0].next.filters;
  if (!filters) throw new Error("Expected persisted filters");
  const child = filters.children[0];
  if (child?.kind !== "rule") {
    throw new Error("Expected the first filter child to be a rule");
  }
  return child;
}

function lastValue(onViewChange: ViewChangeMock) {
  return lastRule(onViewChange).value;
}

function dateValue(timestamp: unknown) {
  return new Date(timestamp as number).toISOString().slice(0, 10);
}
