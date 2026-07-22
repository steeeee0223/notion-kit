import { describe, expect, it } from "vitest";

import type { CellPlugin, ColumnInfo, Row } from "@notion-kit/table-hook";

import {
  checkbox,
  createdTime,
  date,
  email,
  lastEditedTime,
  multiSelect,
  number,
  phone,
  select,
  text,
  title,
  url,
} from "@/plugins";

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
    ["checkbox false first", checkbox(), false, true, -1],
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
    expect(select().fromValue(" Missing, Done, Active, Done ", config)).toBe(
      "Done",
    );
    expect(select().fromValue(42, config)).toBeNull();
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
