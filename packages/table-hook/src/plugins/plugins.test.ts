import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ColumnInfo, Row } from "@/lib/types";
import { arrayToEntity } from "@/lib/utils";
import { resolveCountingMethod } from "@/methods";
import type { CellPlugin, FilterValue } from "@/plugins";
import {
  checkbox as createCheckbox,
  createdTime as createCreatedTime,
  date as createDate,
  email as createEmail,
  lastEditedTime as createLastEditedTime,
  multiSelect as createMultiSelect,
  number as createNumber,
  phone as createPhone,
  select as createSelect,
  text as createText,
  title as createTitle,
  url as createUrl,
  extractDateValue,
  textMethodCapabilities,
  withDateCalculations,
} from "@/plugins";
import { useTableView } from "@/table-contexts/use-table-view";

const title = () => createTitle();
const text = () => createText();
const number = () => createNumber();
const checkbox = () => createCheckbox();
const select = () => createSelect();
const multiSelect = () => createMultiSelect();
const email = () => createEmail();
const phone = () => createPhone();
const url = () => createUrl();
const date = () => createDate();
const createdTime = () => createCreatedTime();
const lastEditedTime = () => createLastEditedTime();
const DEFAULT_PLUGINS = [
  title(),
  text(),
  number(),
  checkbox(),
  select(),
  multiSelect(),
  email(),
  phone(),
  url(),
  date(),
  createdTime(),
  lastEditedTime(),
];

function matches(
  plugin: CellPlugin,
  operatorId: string,
  data: unknown,
  operand?: FilterValue,
  currentRow: Row = baseRow,
  pluginConfig: unknown = plugin.default.config,
  context = { now: Date.UTC(2025, 0, 15, 12) },
) {
  const operator = plugin.filtering?.operators.find(
    ({ id }) => id === operatorId,
  );
  if (!operator) throw new Error(`Missing ${plugin.id}.${operatorId}`);
  return operator.matches(data, currentRow, pluginConfig, operand, context);
}

describe("Built-in filtering capability matrix", () => {
  it("registers stable ordered operators and UI-neutral operand metadata", () => {
    const matrix = Object.fromEntries(
      DEFAULT_PLUGINS.map((plugin) => [
        plugin.id,
        plugin.filtering?.operators.map(({ id, operand }) => [id, operand]),
      ]),
    );

    const textOperators = [
      ["equals", { kind: "text" }],
      ["does-not-equal", { kind: "text" }],
      ["contains", { kind: "text" }],
      ["does-not-contain", { kind: "text" }],
      ["starts-with", { kind: "text" }],
      ["ends-with", { kind: "text" }],
      ["is-empty", { kind: "none" }],
      ["is-not-empty", { kind: "none" }],
    ];
    for (const id of ["title", "text", "email", "phone", "url"]) {
      expect(matrix[id]).toEqual(textOperators);
    }
    expect(matrix.select).toEqual([
      ["contains", { kind: "option" }],
      ["does-not-contain", { kind: "option" }],
      ["is-empty", { kind: "none" }],
      ["is-not-empty", { kind: "none" }],
    ]);
    expect(matrix["multi-select"]).toEqual([
      ["contains", { kind: "option", multiple: true }],
      ["does-not-contain", { kind: "option", multiple: true }],
      ["is-empty", { kind: "none" }],
      ["is-not-empty", { kind: "none" }],
    ]);
    expect(matrix.checkbox).toEqual([
      ["is-checked", { kind: "none" }],
      ["is-unchecked", { kind: "none" }],
    ]);
    expect(matrix.number).toEqual([
      ["equals", { kind: "number" }],
      ["does-not-equal", { kind: "number" }],
      ["greater-than", { kind: "number" }],
      ["less-than", { kind: "number" }],
      ["greater-than-or-equal", { kind: "number" }],
      ["less-than-or-equal", { kind: "number" }],
      ["is-empty", { kind: "none" }],
      ["is-not-empty", { kind: "none" }],
    ]);
    for (const id of ["date", "created-time", "last-edited-time"]) {
      expect(matrix[id]).toEqual([
        ["equals", { kind: "date" }],
        ["before", { kind: "date" }],
        ["after", { kind: "date" }],
        ["on-or-before", { kind: "date" }],
        ["on-or-after", { kind: "date" }],
        ["between", { kind: "date-range" }],
        ["is-empty", { kind: "none" }],
        ["is-not-empty", { kind: "none" }],
        ["relative-to-today", { kind: "relative-date" }],
      ]);
    }
  });
});

describe("Text-like filter operators", () => {
  it.each([title(), text(), email(), phone(), url()])(
    "$id normalizes case and matches every text operator against canonical data",
    (plugin) => {
      expect(matches(plugin, "equals", "Alpha Beta", "alpha beta")).toBe(true);
      expect(matches(plugin, "does-not-equal", "Alpha", "beta")).toBe(true);
      expect(matches(plugin, "contains", "Alpha Beta", "HA b")).toBe(true);
      expect(matches(plugin, "does-not-contain", "Alpha", "beta")).toBe(true);
      expect(matches(plugin, "starts-with", "Alpha Beta", "ALP")).toBe(true);
      expect(matches(plugin, "ends-with", "Alpha Beta", "BETA")).toBe(true);
      expect(matches(plugin, "is-empty", "")).toBe(true);
      expect(matches(plugin, "is-not-empty", "x")).toBe(true);
      expect(matches(plugin, "equals", "Alpha", 1)).toBe(false);
    },
  );
});

describe("Choice, checkbox, and number filter operators", () => {
  it("matches exact select values and complete multi-select operands without treating null as a value", () => {
    expect(matches(select(), "contains", "Done", "Done")).toBe(true);
    expect(matches(select(), "does-not-contain", "Done", "Other")).toBe(true);
    expect(matches(select(), "is-empty", null)).toBe(true);
    expect(
      matches(multiSelect(), "contains", ["Todo", "Done"], ["Todo", "Done"]),
    ).toBe(true);
    expect(matches(multiSelect(), "contains", ["Todo"], ["Todo", "Done"])).toBe(
      false,
    );
    expect(
      matches(multiSelect(), "does-not-contain", ["Todo"], ["Done", "Later"]),
    ).toBe(true);
    expect(
      matches(
        multiSelect(),
        "does-not-contain",
        ["Todo", "Done"],
        ["Todo", "Later"],
      ),
    ).toBe(false);
    expect(matches(multiSelect(), "contains", ["Done"], "Done")).toBe(false);
    expect(matches(multiSelect(), "is-empty", [])).toBe(true);
    expect(matches(multiSelect(), "is-not-empty", ["Todo"])).toBe(true);
  });

  it("matches checked and unchecked canonical booleans", () => {
    expect(matches(checkbox(), "is-checked", true)).toBe(true);
    expect(matches(checkbox(), "is-checked", false)).toBe(false);
    expect(matches(checkbox(), "is-unchecked", false)).toBe(true);
    expect(matches(checkbox(), "is-unchecked", undefined)).toBe(false);
  });

  it("matches numeric boundaries and rejects invalid data or operands", () => {
    const plugin = number();
    expect(matches(plugin, "equals", "10", 10)).toBe(true);
    expect(matches(plugin, "does-not-equal", "10", 11)).toBe(true);
    expect(matches(plugin, "greater-than", "10", 9)).toBe(true);
    expect(matches(plugin, "less-than", "10", 11)).toBe(true);
    expect(matches(plugin, "greater-than-or-equal", "10", 10)).toBe(true);
    expect(matches(plugin, "less-than-or-equal", "10", 10)).toBe(true);
    expect(matches(plugin, "is-empty", null)).toBe(true);
    expect(matches(plugin, "is-empty", "   ")).toBe(true);
    expect(matches(plugin, "is-not-empty", "0")).toBe(true);
    expect(matches(plugin, "is-not-empty", "   ")).toBe(false);
    for (const operand of [
      "10",
      null,
      Number.NaN,
    ] as unknown as FilterValue[]) {
      expect(matches(plugin, "equals", "10", operand)).toBe(false);
    }
    expect(matches(plugin, "equals", "invalid", 0)).toBe(false);
    expect(matches(plugin, "does-not-equal", "invalid", 0)).toBe(false);
  });
});

describe("Date filter operators", () => {
  const config = {
    dateFormat: "full" as const,
    timeFormat: "24-hour" as const,
    tz: "America/Los_Angeles",
  };
  const jan15 = Date.UTC(2025, 0, 15, 12);
  const jan15Later = Date.UTC(2025, 0, 15, 20);
  const jan16 = Date.UTC(2025, 0, 16, 20);

  it("uses calendar days for untimed values and exact boundaries for timed values", () => {
    const plugin = date();
    expect(
      matches(
        plugin,
        "equals",
        { start: jan15, includeTime: false },
        { timestamp: jan15Later },
        baseRow,
        config,
      ),
    ).toBe(true);
    expect(
      matches(
        plugin,
        "equals",
        { start: jan15, includeTime: true },
        { timestamp: jan15Later },
        baseRow,
        config,
      ),
    ).toBe(false);
    expect(
      matches(
        plugin,
        "before",
        { start: jan15, includeTime: true },
        { timestamp: jan15Later },
        baseRow,
        config,
      ),
    ).toBe(true);
    expect(
      matches(
        plugin,
        "after",
        { start: jan15Later, includeTime: true },
        { timestamp: jan15 },
        baseRow,
        config,
      ),
    ).toBe(true);
    expect(
      matches(
        plugin,
        "on-or-before",
        { start: jan15 },
        { timestamp: jan15 },
        baseRow,
        config,
      ),
    ).toBe(true);
    expect(
      matches(
        plugin,
        "on-or-after",
        { start: jan15 },
        { timestamp: jan15 },
        baseRow,
        config,
      ),
    ).toBe(true);
  });

  it("supports inclusive ranges, emptiness, and rejects malformed operands", () => {
    const plugin = date();
    expect(
      matches(
        plugin,
        "between",
        { start: jan15Later, includeTime: true },
        { start: jan15, end: jan16 },
        baseRow,
        config,
      ),
    ).toBe(true);
    expect(
      matches(
        plugin,
        "between",
        { start: jan16, includeTime: true },
        { start: jan15, end: jan16 },
        baseRow,
        config,
      ),
    ).toBe(true);
    expect(matches(plugin, "is-empty", {})).toBe(true);
    expect(matches(plugin, "is-not-empty", { start: jan15 })).toBe(true);
    expect(
      matches(
        plugin,
        "equals",
        { start: jan15 },
        { timestamp: "bad" },
        baseRow,
        config,
      ),
    ).toBe(false);
    expect(
      matches(
        plugin,
        "between",
        { start: jan15 },
        { start: jan16, end: jan15 },
        baseRow,
        config,
      ),
    ).toBe(false);
  });

  it("uses row timestamps for derived date matching without cell data", () => {
    expect(
      matches(
        createdTime(),
        "equals",
        undefined,
        { timestamp: baseRow.createdAt },
        baseRow,
        { ...config, tz: "UTC" },
      ),
    ).toBe(true);
    expect(
      matches(
        lastEditedTime(),
        "equals",
        undefined,
        { timestamp: baseRow.lastEditedAt },
        baseRow,
        { ...config, tz: "UTC" },
      ),
    ).toBe(true);
    expect(
      matches(createdTime(), "is-empty", undefined, undefined, baseRow, config),
    ).toBe(false);
  });

  it("matches signed relative day amounts", () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(Date.UTC(2030, 0, 1));
      expect(
        matches(
          date(),
          "relative-to-today",
          { start: jan15, includeTime: false },
          { amount: 0, unit: "day" },
          baseRow,
          { ...config, tz: "UTC" },
        ),
      ).toBe(true);
      vi.setSystemTime(Date.UTC(2040, 0, 1));
      expect(
        matches(
          date(),
          "relative-to-today",
          { start: jan15, includeTime: false },
          { amount: 0, unit: "day" },
          baseRow,
          { ...config, tz: "UTC" },
          { now: Date.UTC(2025, 0, 15, 12) },
        ),
      ).toBe(true);
      expect(
        matches(
          date(),
          "relative-to-today",
          { start: jan16, includeTime: false },
          { amount: 1, unit: "day" },
          baseRow,
          { ...config, tz: "UTC" },
        ),
      ).toBe(true);
      expect(
        matches(
          date(),
          "relative-to-today",
          { start: jan16 },
          { amount: 1.5, unit: "day" },
          baseRow,
          config,
        ),
      ).toBe(false);
      expect(
        matches(
          date(),
          "relative-to-today",
          { start: jan16, includeTime: false },
          { offsetDays: 1 },
          baseRow,
          { ...config, tz: "UTC" },
          { now: Date.UTC(2025, 0, 15, 12) },
        ),
      ).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("matches signed relative calendar units in the property timezone", () => {
    expect(
      matches(
        date(),
        "relative-to-today",
        { start: Date.UTC(2025, 1, 28, 12), includeTime: false },
        { amount: 1, unit: "month" },
        baseRow,
        { ...config, tz: "UTC" },
        { now: Date.UTC(2025, 0, 31, 12) },
      ),
    ).toBe(true);
    expect(
      matches(
        date(),
        "relative-to-today",
        { start: Date.UTC(2024, 0, 31, 12), includeTime: false },
        { amount: -1, unit: "year" },
        baseRow,
        { ...config, tz: "UTC" },
        { now: Date.UTC(2025, 0, 31, 12) },
      ),
    ).toBe(true);
    expect(
      matches(
        date(),
        "relative-to-today",
        { start: jan16, includeTime: false },
        { amount: 1, unit: "hour" },
        baseRow,
        config,
      ),
    ).toBe(false);
  });

  it("fails closed for invalid ECMAScript date operands without throwing", () => {
    const plugin = date();
    const cases: [string, unknown, FilterValue][] = [
      ["equals", { start: jan15, includeTime: true }, { timestamp: 1e308 }],
      ["equals", { start: 1e308, includeTime: false }, { timestamp: jan15 }],
      ["on-or-before", { start: jan15 }, { timestamp: 1e308 }],
      ["between", { start: jan15 }, { start: -1e308, end: 1e308 }],
      ["relative-to-today", { start: jan15 }, { offsetDays: 1e308 }],
    ];
    for (const [operator, data, operand] of cases) {
      expect(() =>
        matches(plugin, operator, data, operand, baseRow, config),
      ).not.toThrow();
      expect(matches(plugin, operator, data, operand, baseRow, config)).toBe(
        false,
      );
    }
  });
});

describe("data plugin factories", () => {
  it.each([title(), text(), number(), checkbox(), select(), multiSelect()])(
    "TestDataPluginFactory_BuiltInPlugin_ExposesNoUiContractFor$Id",
    (plugin) => {
      expect(plugin.id).toBeTypeOf("string");
      expect(plugin.default).toBeTypeOf("object");
      expect(plugin.fromValue).toBeTypeOf("function");
      expect(plugin.toValue).toBeTypeOf("function");
      expect(plugin.toTextValue).toBeTypeOf("function");
      expect(plugin.isEmpty).toBeTypeOf("function");
      expect(plugin).not.toHaveProperty("meta");
      expect(plugin).not.toHaveProperty("renderCellValue");
      expect(plugin).not.toHaveProperty("renderCellEditor");
      expect(plugin).not.toHaveProperty("renderConfigMenu");
      expect(plugin).not.toHaveProperty("renderGroupingValue");
      expect(plugin).not.toHaveProperty("disableBulkEdit");
    },
  );
});

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
    const plugin = text();
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
    const titlePlugin = title();
    const textPlugin = text();
    const numberPlugin = number();
    const checkboxPlugin = checkbox();

    expect(titlePlugin.toValue("Task", baseRow)).toBe("Task");
    expect(textPlugin.toTextValue("notes", baseRow)).toBe("notes");
    expect(textPlugin.isEmpty("   ")).toBe(true);
    expect(numberPlugin.toTextValue(null, baseRow)).toBe("");
    expect(numberPlugin.isEmpty("abc")).toBe(true);
    expect(numberPlugin.isEmpty("0")).toBe(false);
    expect(checkboxPlugin.toTextValue(true, baseRow)).toBe("✅");
    expect(checkboxPlugin.toTextValue(false, baseRow)).toBe("");
    expect(checkboxPlugin.isEmpty(false)).toBe(true);
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

  it("keeps unchecked empty rows last in both directions", () => {
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
    ).toEqual(["checked", "unchecked"]);
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
