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
import { isoToTs } from "@notion-kit/utils";

import { FilterMenu } from ".";
import { renderTableView } from "../../__tests__/component-objects/render-table-view";
import { FilterMenuObject } from "../../__tests__/component-objects/table-view";
import {
  createFullPluginFixture,
  mockResizeObserver,
} from "../../__tests__/mock";
import { TableViewWrapper } from "../../table-contexts";

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
  it("selects a property, operator, and text operand and persists each edit", async () => {
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

    await filter.chooseLogic("level-2", "OR");
    expect(filter.logic("level-2")).toHaveTextContent("Or");
    await filter.openAddMenu("level-3");
    expect(await filter.addMenuItem("Add rule")).toBeVisible();
    expect(
      screen.queryByRole("menuitem", { name: "Add nested group" }),
    ).not.toBeInTheDocument();
    await tableView.user.keyboard("{Escape}");

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

  it("creates the default title rule only after Add rule is selected", async () => {
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
      await tableView.filterMenu().addMenuItem("Add rule"),
    );
    await waitFor(() => expect(onViewChange).toHaveBeenCalledOnce());
    expect(onViewChange.mock.lastCall![0].next.filters).toMatchObject({
      children: [{ propertyId: "title", operator: "equals" }],
    });
    expect(
      screen.queryByRole("combobox", { name: "Add property select" }),
    ).toBeNull();
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
    await tableView.user.click(await filter.addMenuItem("Add rule"));
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
    await tableView.user.click(await filter.addMenuItem("Add nested group"));

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
    await tableView.user.click(await filter.addMenuItem("Add rule"));

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
      screen.queryByRole("menuitem", { name: "Add rule" }),
    ).not.toBeInTheDocument();
    await tableView.user.click(await filter.addMenuItem("Add nested group"));

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

    expect(filter.rowLabel("first")).toHaveTextContent("Where");
    expect(filter.rowLabel("second")).toHaveTextContent("And");
    expect(filter.rowLabel("third")).toHaveTextContent("And");
    expect(filter.rowLabel("nested-first")).toHaveTextContent("Where");
    expect(filter.rowLabel("nested-second")).toHaveTextContent("And");
    expect(filter.rowLabel("nested-third")).toHaveTextContent("And");

    expect(filter.logic("second")).toBeVisible();
    expect(filter.logic("nested-second")).toBeVisible();
    expect(within(filter.rowLabel("third")).queryByRole("combobox")).toBeNull();
    expect(
      within(filter.rowLabel("nested-third")).queryByRole("combobox"),
    ).toBeNull();

    await tableView.user.click(filter.logic("second"));
    await tableView.user.click(
      await screen.findByRole("option", { name: "OR" }),
    );
    expect(filter.rowLabel("second")).toHaveTextContent("Or");
    expect(filter.rowLabel("third")).toHaveTextContent("Or");
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
  ["relative-date", "relative-op", "-3", { offsetDays: -3 }],
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

  it("persists valid dates and only complete ordered ranges", async () => {
    const date = renderMetadataMenu("date", "date-op");
    await date.tableView.user.type(
      date.tableView.filterMenu().operand("operand-rule"),
      "2026-08-26",
    );
    expect(
      dateValue(
        (lastValue(date.onViewChange) as { timestamp: number }).timestamp,
      ),
    ).toBe("2026-08-26");

    cleanup();
    const range = renderMetadataMenu("date-range", "range-op");
    await range.tableView.user.type(
      range.tableView.filterMenu().operand("operand-rule", "Start"),
      "2026-08-26",
    );
    expect(range.onViewChange).not.toHaveBeenCalled();
    await range.tableView.user.type(
      range.tableView.filterMenu().operand("operand-rule", "End"),
      "2026-08-27",
    );
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
    expect(lastValue(number.onViewChange)).toBe(1);
    number.onViewChange.mockClear();
    await number.tableView.user.type(
      number.tableView.filterMenu().operand("operand-rule"),
      "e",
    );
    expect(number.onViewChange).not.toHaveBeenCalled();

    cleanup();
    const relative = renderMetadataMenu("relative-date", "relative-op");
    await relative.tableView.user.type(
      relative.tableView.filterMenu().operand("operand-rule"),
      "1",
    );
    expect(lastValue(relative.onViewChange)).toEqual({ offsetDays: 1 });
    relative.onViewChange.mockClear();
    await relative.tableView.user.type(
      relative.tableView.filterMenu().operand("operand-rule"),
      ".5",
    );
    expect(relative.onViewChange).not.toHaveBeenCalled();
  });

  it.each([
    ["number", "number-op", 12],
    ["relative-date", "relative-op", { offsetDays: 2 }],
    ["date", "date-op", { timestamp: Date.UTC(2026, 7, 26) }],
    [
      "date-range",
      "range-op",
      { start: Date.UTC(2026, 7, 26), end: Date.UTC(2026, 7, 27) },
    ],
  ] as const)(
    "omits an existing %s operand when it becomes incomplete",
    async (kind, operator, existingValue) => {
      const operand = renderMetadataMenu(kind, operator, {
        value: existingValue,
      });
      await operand.tableView.user.clear(
        operand.tableView
          .filterMenu()
          .operand("operand-rule", kind === "date-range" ? "Start" : "Value"),
      );
      await operand.tableView.user.tab();

      expect(lastRule(operand.onViewChange)).not.toHaveProperty("value");
    },
  );

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
      date.tableView
        .filterMenu()
        .calendarButton("operand-rule", "Open calendar"),
    );
    await date.tableView.user.click(
      await screen.findByRole("button", {
        name: /August 27th, 2026/,
      }),
    );

    expect(lastValue(date.onViewChange)).toEqual({
      timestamp: isoToTs(
        { date: "2026-08-27", time: "00:00:00" },
        "America/Los_Angeles",
      ),
    });
  });

  it("selects both date-range endpoints from Calendar", async () => {
    const timeZone = "America/Los_Angeles";
    const range = renderMetadataMenu(
      "date-range",
      "range-op",
      {
        value: {
          start: isoToTs({ date: "2026-08-25", time: "00:00:00" }, timeZone),
          end: isoToTs({ date: "2026-08-30", time: "00:00:00" }, timeZone),
        },
      },
      { tz: timeZone },
    );
    await range.tableView.user.click(
      range.tableView
        .filterMenu()
        .calendarButton("operand-rule", "Open start calendar"),
    );
    await range.tableView.user.click(
      await screen.findByRole("button", { name: /August 26th, 2026/ }),
    );
    await range.tableView.user.click(
      range.tableView
        .filterMenu()
        .calendarButton("operand-rule", "Open end calendar"),
    );
    await range.tableView.user.click(
      await screen.findByRole("button", { name: /August 27th, 2026/ }),
    );

    expect(lastValue(range.onViewChange)).toEqual({
      start: isoToTs({ date: "2026-08-26", time: "00:00:00" }, timeZone),
      end: isoToTs({ date: "2026-08-27", time: "00:00:00" }, timeZone),
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
    const operand = date.tableView.filterMenu().operand("operand-rule");
    expect(operand).toHaveValue("1960-01-01");

    await date.tableView.user.clear(operand);
    await date.tableView.user.type(
      date.tableView.filterMenu().operand("operand-rule"),
      "1960-01-02",
    );

    expect(lastValue(date.onViewChange)).toEqual({
      timestamp: isoToTs({ date: "1960-01-02", time: "00:00:00" }, timeZone),
    });
  });

  it("uses the configured timezone for typed dates", async () => {
    const date = renderMetadataMenu("date", "date-op", undefined, {
      tz: "America/Los_Angeles",
    });
    await date.tableView.user.type(
      date.tableView.filterMenu().operand("operand-rule"),
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

  it("resyncs date inputs and Calendar selection when only timezone changes", async () => {
    const timestamp = Date.UTC(2026, 7, 26, 6);
    const date = renderControlledMetadata(
      "date",
      "date-op",
      { timestamp },
      { tz: "UTC" },
    );
    expect(date.filter.operand("operand-rule")).toHaveValue("2026-08-26");
    date.rerenderTimeZone("America/Los_Angeles");
    expect(date.filter.operand("operand-rule")).toHaveValue("2026-08-25");
    await date.user.click(
      date.filter.calendarButton("operand-rule", "Open calendar"),
    );
    expect(
      await screen.findByRole("button", {
        name: /August 25th, 2026, selected/,
      }),
    ).toBeVisible();

    cleanup();
    const range = renderControlledMetadata(
      "date-range",
      "range-op",
      { start: timestamp, end: Date.UTC(2026, 7, 27, 6) },
      { tz: "UTC" },
    );
    range.rerenderTimeZone("America/Los_Angeles");
    expect(range.filter.operand("operand-rule", "Start")).toHaveValue(
      "2026-08-25",
    );
    expect(range.filter.operand("operand-rule", "End")).toHaveValue(
      "2026-08-26",
    );
    await range.user.click(
      range.filter.calendarButton("operand-rule", "Open start calendar"),
    );
    expect(
      await screen.findByRole("button", {
        name: /August 25th, 2026, selected/,
      }),
    ).toBeVisible();
  });

  it("rejects invalid, incomplete, and reversed date ranges", async () => {
    const range = renderMetadataMenu("date-range", "range-op");
    const filter = range.tableView.filterMenu();
    await range.tableView.user.type(
      filter.operand("operand-rule", "Start"),
      "2026-08-27",
    );
    await range.tableView.user.tab();
    await range.tableView.user.type(
      filter.operand("operand-rule", "End"),
      "invalid",
    );
    await range.tableView.user.tab();
    expect(range.onViewChange).not.toHaveBeenCalled();

    await range.tableView.user.clear(filter.operand("operand-rule", "End"));
    await range.tableView.user.type(
      filter.operand("operand-rule", "End"),
      "2026-08-26",
    );
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
    expect(date.filter.operand("operand-rule")).toHaveValue("2026-08-26");
    date.rerenderValue({ timestamp: second });
    expect(date.filter.operand("operand-rule")).toHaveValue("2026-08-27");

    cleanup();
    const relative = renderControlledMetadata("relative-date", "relative-op", {
      offsetDays: 2,
    });
    expect(relative.filter.operand("operand-rule")).toHaveValue("2");
    relative.rerenderValue({ offsetDays: -4 });
    expect(relative.filter.operand("operand-rule")).toHaveValue("-4");
  });

  it("excludes deleted and unsupported properties from pending rules", async () => {
    const supported = metadataPlugin("text", "text-op");
    const unsupported: CellPlugin<"unsupported", string, undefined> = {
      id: "unsupported",
      meta: { name: "Unsupported", desc: "Unsupported", icon: null },
      default: { name: "Unsupported", icon: null, data: "", config: undefined },
      fromValue: String,
      toValue: (value) => value,
      toTextValue: (value) => value,
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
    await tableView.user.click(
      await tableView.filterMenu().addMenuItem("Add rule"),
    );

    expect(await screen.findByRole("option", { name: "Live" })).toBeVisible();
    expect(
      screen.queryByRole("option", { name: "Deleted" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Unsupported" }),
    ).not.toBeInTheDocument();
  });
});

function renderMetadataMenu(
  kind: FilterOperandMetadata["kind"],
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
    plugins: [metadataPlugin(kind, operator)],
    properties: [metadataProperty("metadata", "Metadata", configOverrides)],
  });
  return { tableView, onViewChange };
}

interface MetadataConfig {
  options: { names: string[]; items: Record<string, { name: string }> };
  tz?: string;
}
type MetadataPlugin = CellPlugin<"metadata", string, MetadataConfig>;

function metadataPlugin(
  kind: FilterOperandMetadata["kind"],
  operator: string,
): MetadataPlugin {
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
    filtering: {
      operators: [
        {
          id: operator,
          name: operator,
          operand: { kind } as FilterOperandMetadata,
          matches: () => false,
        },
        ...(kind === "none"
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
        items: { Alpha: { name: "Alpha" }, Beta: { name: "Beta" } },
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
