import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  arrayToEntity,
  resolveCountingMethod,
  useTableView,
  type CellPlugin,
  type ColumnInfo,
  type Row,
} from "@notion-kit/table-hook";

import {
  checkbox,
  createdTime,
  date,
  DEFAULT_PLUGINS,
  email,
  lastEditedTime,
  multiSelect,
  number,
  phone,
  select,
  text,
  textMethodCapabilities,
  title,
  url,
  withGenericCounting,
} from "@/plugins";
import { extractDateValue, withDateCalculations } from "@/plugins/date/plugin";

const methodMatrix = {
  title: {
    sorting: ["text"],
    directions: ["A → Z", "Z → A"],
    grouping: ["exact", "alphabetical"],
    counting: [
      "all",
      "values",
      "unique",
      "empty",
      "nonempty",
      "percentage-empty",
      "percentage-nonempty",
    ],
    groupSort: true,
  },
  text: {
    sorting: ["text"],
    directions: ["A → Z", "Z → A"],
    grouping: ["exact", "alphabetical"],
    counting: [
      "all",
      "values",
      "unique",
      "empty",
      "nonempty",
      "percentage-empty",
      "percentage-nonempty",
    ],
    groupSort: true,
  },
  email: {
    sorting: ["text"],
    directions: ["A → Z", "Z → A"],
    grouping: ["exact", "alphabetical"],
    counting: [
      "all",
      "values",
      "unique",
      "empty",
      "nonempty",
      "percentage-empty",
      "percentage-nonempty",
    ],
    groupSort: true,
  },
  phone: {
    sorting: ["text"],
    directions: ["A → Z", "Z → A"],
    grouping: ["exact", "alphabetical"],
    counting: [
      "all",
      "values",
      "unique",
      "empty",
      "nonempty",
      "percentage-empty",
      "percentage-nonempty",
    ],
    groupSort: true,
  },
  url: {
    sorting: ["text"],
    directions: ["A → Z", "Z → A"],
    grouping: ["exact", "alphabetical"],
    counting: [
      "all",
      "values",
      "unique",
      "empty",
      "nonempty",
      "percentage-empty",
      "percentage-nonempty",
    ],
    groupSort: true,
  },
  select: {
    sorting: ["select"],
    directions: ["Ascending", "Descending"],
    grouping: ["value"],
    counting: [
      "all",
      "values",
      "unique",
      "empty",
      "nonempty",
      "percentage-empty",
      "percentage-nonempty",
    ],
    groupSort: true,
  },
  "multi-select": {
    sorting: ["select"],
    directions: ["Ascending", "Descending"],
    grouping: ["value"],
    counting: [
      "all",
      "values",
      "unique",
      "empty",
      "nonempty",
      "percentage-empty",
      "percentage-nonempty",
    ],
    groupSort: true,
  },
  checkbox: {
    sorting: ["checkbox"],
    directions: ["Checked → unchecked", "Unchecked → checked"],
    grouping: ["value"],
    counting: [
      "all",
      "checked",
      "unchecked",
      "percentage-checked",
      "percentage-unchecked",
    ],
    groupSort: false,
  },
  number: {
    sorting: ["number"],
    directions: ["Low → high", "High → low"],
    grouping: ["interval-1", "interval-10", "interval-100", "interval-1000"],
    counting: [
      "all",
      "values",
      "unique",
      "empty",
      "nonempty",
      "percentage-empty",
      "percentage-nonempty",
      "sum",
      "average",
      "median",
      "minimum",
      "maximum",
      "range",
    ],
    groupSort: true,
  },
  date: {
    sorting: ["date"],
    directions: ["Old → new", "New → old"],
    grouping: ["relative", "day", "week", "month", "year"],
    counting: [
      "all",
      "values",
      "unique",
      "empty",
      "nonempty",
      "percentage-empty",
      "percentage-nonempty",
      "earliest-date",
      "latest-date",
      "date-range",
    ],
    groupSort: true,
  },
  "created-time": {
    sorting: ["date"],
    directions: ["Old → new", "New → old"],
    grouping: ["relative", "day", "week", "month", "year"],
    counting: [
      "all",
      "values",
      "unique",
      "empty",
      "nonempty",
      "percentage-empty",
      "percentage-nonempty",
      "earliest-date",
      "latest-date",
      "date-range",
    ],
    groupSort: true,
  },
  "last-edited-time": {
    sorting: ["date"],
    directions: ["Old → new", "New → old"],
    grouping: ["relative", "day", "week", "month", "year"],
    counting: [
      "all",
      "values",
      "unique",
      "empty",
      "nonempty",
      "percentage-empty",
      "percentage-nonempty",
      "earliest-date",
      "latest-date",
      "date-range",
    ],
    groupSort: true,
  },
} as const;

describe("Built-in method registration matrix", () => {
  it("registers exactly the approved capabilities and direction labels", () => {
    expect(
      Object.fromEntries(
        DEFAULT_PLUGINS.map((plugin) => {
          const sorting = plugin.sorting?.methods ?? [];
          return [
            plugin.id,
            {
              sorting: sorting.map((method) => method.id),
              directions: sorting.flatMap((method) =>
                "ascendingLabel" in method
                  ? [method.ascendingLabel, method.descendingLabel]
                  : [],
              ),
              grouping:
                plugin.grouping?.methods.map((method) => method.id) ?? [],
              counting:
                plugin.counting?.flatMap((group) =>
                  group.functions.map((method) => method.id),
                ) ?? [],
              groupSort: plugin.sorting?.enableGroupSort !== false,
            },
          ];
        }),
      ),
    ).toEqual(methodMatrix);
  });
});

describe("Built-in descriptor fallback branches", () => {
  it("formats capped and zero-total generic counts", () => {
    const plugin = withGenericCounting(text());
    const countAll = resolveCountingMethod(plugin, "all")!;
    const percentageEmpty = resolveCountingMethod(plugin, "percentage-empty")!;

    expect(countAll.formatResult?.(120, { isCapped: true } as never)).toBe(
      "99+",
    );
    expect(percentageEmpty.formatResult?.(0, { rows: [] } as never)).toBe(
      "0.0%",
    );
  });

  it("normalizes null text sorting values", () => {
    const method = textMethodCapabilities<unknown>().sorting.methods[0]!;
    expect(method.toComparable(null)).toBe("");
  });

  it("covers empty and timezone-aware date descriptor paths", () => {
    expect(extractDateValue(undefined, baseRow)).toEqual({});

    const plugin = date();
    const grouping = plugin.grouping!.methods[0]!;
    const context = {
      config: { ...plugin.default.config, tz: "Asia/Taipei" },
      weekStartsOn: 1 as const,
    };
    const value = grouping.function(
      { start: Date.UTC(2025, 0, 1) },
      baseRow,
      "value",
      context as never,
    );
    expect(grouping.toSortValue?.(value, context as never)).not.toBeNull();

    const calculations = withDateCalculations([], extractDateValue)[0]!
      .functions;
    const range = calculations.find(({ id }) => id === "date-range")!;
    const earliest = calculations.find(({ id }) => id === "earliest-date")!;
    const formatContext = {
      table: { getColumnInfo: () => ({ config: plugin.default.config }) },
      colId: "value",
    } as never;
    expect(range.formatResult?.("", formatContext)).toBe("");
    expect(
      range.formatResult?.(
        { start: Date.UTC(2025, 0, 1), end: Date.UTC(2025, 0, 2) },
        formatContext,
      ),
    ).toBeTruthy();
    expect(
      earliest.formatResult?.({ value: Date.UTC(2025, 0, 1) }, formatContext),
    ).toBeTruthy();
  });
});

const baseRow: Row = {
  id: "row",
  createdAt: Date.UTC(2025, 0, 1, 1, 2),
  lastEditedAt: Date.UTC(2025, 0, 2, 3, 4),
  properties: {},
};

function row(value: unknown, overrides: Partial<Row> = {}): Row {
  return {
    ...baseRow,
    ...overrides,
    properties: { value: { id: "cell", value } },
  } as Row;
}

describe("Scalar plugin value contracts", () => {
  it.each([
    ["title null", title(), null, ""],
    ["title number", title(), 42, "42"],
    ["text null", text(), null, ""],
    ["text boolean", text(), true, "true"],
    ["number invalid", number(), "not-a-number", null],
    ["number decimal", number(), "-1.25", "-1.25"],
    ["checkbox input", checkbox(), true, false],
    ["email non-string", email(), 42, ""],
    ["phone string", phone(), "+886", "+886"],
    ["url string", url(), "https://example.com", "https://example.com"],
    ["date input", date(), "2025-01-01", {}],
  ])(
    "PluginFromValue_%s_ReturnsCanonicalData",
    (_case, plugin, input, expected) => {
      const scalar = plugin as CellPlugin;
      expect(scalar.fromValue(input, scalar.default.config)).toEqual(expected);
    },
  );

  it("NumberPlugin_ZeroToValue_PreservesZero", () => {
    expect(number().toValue("0", baseRow)).toBe(0);
  });

  it("ScalarPlugins_ToValueAndText_PreserveCanonicalMeaning", () => {
    expect(title().toValue("Task", baseRow)).toBe("Task");
    expect(text().toTextValue("notes", baseRow)).toBe("notes");
    expect(number().toTextValue(null, baseRow)).toBe("");
    expect(checkbox().toTextValue(true, baseRow)).toBe("✅");
    expect(checkbox().toTextValue(false, baseRow)).toBe("");
    expect(email().toValue("a@example.com", baseRow)).toBe("a@example.com");
  });
});

describe("Plugin sorting boundaries", () => {
  it.each([
    ["text less", text(), "Alpha", "Omega", -1],
    ["title equal", title(), "Same", "Same", 0],
    ["number less", number(), "10", "90", -1],
    ["number null last", number(), null, "10", 1],
    ["number null equal", number(), null, null, 0],
    ["checkbox checked first", checkbox(), false, true, 1],
    ["email greater", email(), "z@example.com", "a@example.com", 1],
    ["date earlier", date(), { start: 1 }, { start: 2 }, -1],
    ["date empty last", date(), {}, { start: 2 }, 1],
    ["date empty equal", date(), {}, {}, 0],
  ])(
    "PluginCompare_%s_UsesDocumentedOrdering",
    (_case, plugin, a, b, direction) => {
      expect(Math.sign(plugin.compare!(row(a), row(b), "value"))).toBe(
        direction,
      );
    },
  );

  it("orders checkbox rows in the direction named by its sorting labels", () => {
    const plugin = checkbox();
    const method = plugin.sorting!.methods[0]!;
    if (!("ascendingLabel" in method)) throw new Error("Expected value method");
    const { result } = renderHook(() =>
      useTableView({
        plugins: arrayToEntity([plugin]),
        defaultProperties: [
          {
            id: "value",
            name: "Done",
            type: "checkbox",
            width: "100",
            config: undefined,
          },
        ],
        defaultData: [
          row(false, { id: "unchecked" }),
          row(true, { id: "checked" }),
        ],
      }),
    );

    expect(method.ascendingLabel).toBe("Checked → unchecked");
    act(() => result.current.table.setSorting([{ id: "value", desc: false }]));
    expect(
      result.current.table.getSortedRowModel().rows.map(({ id }) => id),
    ).toEqual(["checked", "unchecked"]);
    expect(method.descendingLabel).toBe("Unchecked → checked");
    act(() => result.current.table.setSorting([{ id: "value", desc: true }]));
    expect(
      result.current.table.getSortedRowModel().rows.map(({ id }) => id),
    ).toEqual(["unchecked", "checked"]);
  });

  it("keeps empty dates last in ascending and descending table execution", () => {
    const plugin = date();
    const { result } = renderHook(() =>
      useTableView({
        plugins: arrayToEntity([plugin]),
        defaultProperties: [
          {
            id: "value",
            name: "Due",
            type: "date",
            width: "100",
            config: { ...plugin.default.config, tz: "UTC" },
          },
        ],
        defaultData: [
          row({}, { id: "empty" }),
          row({ start: 1 }, { id: "early" }),
          row({ start: 2 }, { id: "late" }),
        ],
      }),
    );

    act(() => result.current.table.setSorting([{ id: "value", desc: false }]));
    expect(
      result.current.table.getSortedRowModel().rows.map(({ id }) => id),
    ).toEqual(["early", "late", "empty"]);
    act(() => result.current.table.setSorting([{ id: "value", desc: true }]));
    expect(
      result.current.table.getSortedRowModel().rows.map(({ id }) => id),
    ).toEqual(["late", "early", "empty"]);
  });

  it("keeps missing, invalid, and non-finite numbers last both directions", () => {
    const plugin = number();
    const { result } = renderHook(() =>
      useTableView({
        plugins: arrayToEntity([plugin]),
        defaultProperties: [
          {
            id: "value",
            name: "Amount",
            type: "number",
            width: "100",
            config: plugin.default.config,
          },
        ],
        defaultData: [
          row("invalid", { id: "invalid" }),
          row("2", { id: "two" }),
          row(null, { id: "missing", properties: {} }),
          row("1", { id: "one" }),
          row("Infinity", { id: "infinite" }),
        ],
      }),
    );

    act(() => result.current.table.setSorting([{ id: "value", desc: false }]));
    expect(
      result.current.table.getSortedRowModel().rows.map(({ id }) => id),
    ).toEqual(["one", "two", "invalid", "missing", "infinite"]);
    act(() => result.current.table.setSorting([{ id: "value", desc: true }]));
    expect(
      result.current.table.getSortedRowModel().rows.map(({ id }) => id),
    ).toEqual(["two", "one", "invalid", "missing", "infinite"]);
  });
});

describe("Date calculation descriptor formatting", () => {
  const config = {
    dateFormat: "full" as const,
    timeFormat: "24-hour" as const,
    tz: "UTC",
  };
  const timestamp = Date.UTC(2025, 0, 15, 13, 45);
  const context = {
    table: { getColumnInfo: () => ({ config }) },
    colId: "value",
  } as never;

  it.each([
    ["date", "January 15, 2025 13:45"],
    ["created-time", "January 15, 2025 13:45"],
    ["last-edited-time", "January 15, 2025 13:45"],
  ])("formats timed %s boundary results with time", (pluginId, expected) => {
    const plugin = DEFAULT_PLUGINS.find(({ id }) => id === pluginId)!;
    const method = resolveCountingMethod(plugin, "earliest-date")!;
    expect(
      method.formatResult?.({ value: timestamp, includeTime: true }, context),
    ).toBe(expected);
  });
});

describe("Select conversion and grouping contracts", () => {
  const config = {
    sort: "manual" as const,
    options: {
      names: ["Active", "Done"],
      items: {
        Active: { id: "active", name: "Active", color: "blue" as const },
        Done: { id: "done", name: "Done", color: "green" as const },
      },
    },
  };

  it("SelectFromValue_DuplicatesUnknownAndWhitespace_ReturnsFirstKnown", () => {
    const plugin = select();
    expect(plugin.fromValue(" , Missing, Done, Active, Done ", config)).toBe(
      "Done",
    );
    expect(plugin.fromValue(42, config)).toBeNull();
    expect(plugin.toTextValue(null, baseRow)).toBe("");
    expect(plugin.toTextValue("Active", baseRow)).toBe("Active");
  });

  it("MultiSelectFromValue_DeduplicatesKnownOptionsAndPreservesOrder", () => {
    const plugin = multiSelect();
    expect(plugin.fromValue(" Done, Active, Done, Missing ", config)).toEqual([
      "Done",
      "Active",
    ]);
    expect(plugin.toValue(["Done", "Active"], baseRow)).toBe("Done,Active");
    expect(plugin.toGroupValue!([], baseRow)).toBeNull();
    expect(plugin.toGroupValue!(["Done", "Active"], baseRow)).toBe("Done");
  });

  it("SelectCompare_OrdersEmptyValuesAfterNamedOptions", () => {
    const compare = select().compare!;

    expect(compare(row(null), row(null), "value")).toBe(0);
    expect(compare(row(null), row("Active"), "value")).toBeGreaterThan(0);
    expect(compare(row("Active"), row(null), "value")).toBeLessThan(0);
    expect(compare(row("Active"), row("Done"), "value")).toBeLessThan(0);
  });

  it("MultiSelectCompare_UsesFirstTagAndOrdersEmptyArraysLast", () => {
    const compare = multiSelect().compare!;

    expect(compare(row([]), row([]), "value")).toBe(0);
    expect(compare(row([]), row(["Active"]), "value")).toBeGreaterThan(0);
    expect(compare(row(["Active"]), row([]), "value")).toBeLessThan(0);
    expect(
      compare(row(["Active", "Done"]), row(["Done"]), "value"),
    ).toBeLessThan(0);
  });

  it("SelectTransferConfig_TextValues_BuildsTrimmedUniqueOptions", () => {
    const column = {
      id: "value",
      name: "Tags",
      type: "text",
      width: "100",
    } as ColumnInfo;
    const transferred = select().transferConfig!(column, [
      row(" Active, Done "),
      row("Done,,Backlog"),
    ]);

    expect(transferred.options.names).toEqual(["Active", "Done", "Backlog"]);
    expect(Object.keys(transferred.options.items)).toEqual([
      "Active",
      "Done",
      "Backlog",
    ]);
  });

  it("SelectTransferConfig_SelectAndUnsupported_PreservesOrResetsConfig", () => {
    const selectColumn = {
      id: "value",
      name: "Status",
      type: "select",
      width: "100",
      config,
    } as ColumnInfo;
    expect(select().transferConfig!(selectColumn, [])).toBe(config);
    expect(
      select().transferConfig!(
        { ...selectColumn, type: "checkbox" } as ColumnInfo,
        [],
      ),
    ).toEqual({ sort: "manual", options: { names: [], items: {} } });
    expect(
      multiSelect().transferConfig!(
        { ...selectColumn, type: "multi-select" } as ColumnInfo,
        [],
      ),
    ).toBe(config);
  });
});

describe("Date-derived plugin contracts", () => {
  it("DatePlugin_EmptyAndRange_ExposeValueTextAndGroupBoundaries", () => {
    const plugin = date();
    expect(plugin.toValue({}, baseRow)).toBeNull();
    expect(plugin.toValue({ start: 123 }, baseRow)).toBe(123);
    expect(plugin.toTextValue({}, baseRow)).toBe("");
    expect(plugin.toGroupValue!({}, baseRow)).toBeNull();
    expect(plugin.toGroupValue!({ start: baseRow.createdAt }, baseRow)).toBe(
      plugin.toGroupValue!({ start: baseRow.createdAt + 1_000 }, baseRow),
    );
  });

  it("CreatedAndEditedTime_UseRowTimestampsForValueTextGroupAndSort", () => {
    const created = createdTime();
    const edited = lastEditedTime();
    const later = {
      ...baseRow,
      createdAt: baseRow.createdAt + 86_400_000,
      lastEditedAt: baseRow.lastEditedAt + 86_400_000,
    };

    expect(created.fromValue(123, created.default.config)).toBeNull();
    expect(created.toValue(null, baseRow)).toBe(baseRow.createdAt);
    expect(created.toTextValue(null, baseRow)).not.toBe("");
    expect(created.toGroupValue!(null, baseRow)).not.toBeNull();
    expect(created.compare!(baseRow, later, "value")).toBeLessThan(0);
    expect(edited.toValue(null, baseRow)).toBe(baseRow.lastEditedAt);
    expect(edited.toTextValue(null, baseRow)).not.toBe("");
    expect(edited.toGroupValue!(null, baseRow)).not.toBeNull();
    expect(edited.compare!(baseRow, later, "value")).toBeLessThan(0);
  });
});
