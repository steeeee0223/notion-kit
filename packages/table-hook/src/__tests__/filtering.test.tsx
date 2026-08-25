import { describe, expect, it, vi } from "vitest";

import {
  evaluateTableFilter,
  validateTableFilterState,
  type FilterGroup,
} from "@/features/filtering";
import type { ColumnInfo, Row } from "@/lib/types";
import { date as createDate, type CellPlugin } from "@/plugins";

const row: Row = {
  id: "row",
  createdAt: 1,
  lastEditedAt: 2,
  properties: {
    title: { id: "cell", value: "Alpha" },
    status: { id: "cell-2", value: "Done" },
  },
};
const evaluationContext = { now: Date.UTC(2025, 0, 15, 12) };

function rule(
  id: string,
  propertyId: string,
  operator: string,
  value?: string,
) {
  const base = { kind: "rule" as const, id, propertyId, operator };
  return value === undefined ? base : { ...base, value };
}

function group(
  id: string,
  logic: "and" | "or",
  children: FilterGroup["children"],
): FilterGroup {
  return { kind: "group", id, logic, children };
}

function withPrototypePollution(
  properties: Record<string, unknown>,
  assertion: () => void,
) {
  const previous = new Map(
    Object.keys(properties).map((key) => [
      key,
      Reflect.getOwnPropertyDescriptor(Object.prototype, key),
    ]),
  );
  for (const [key, value] of Object.entries(properties)) {
    Object.defineProperty(Object.prototype, key, {
      configurable: true,
      enumerable: false,
      writable: true,
      value,
    });
  }
  try {
    assertion();
  } finally {
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(Object.prototype, key, descriptor);
      else Reflect.deleteProperty(Object.prototype, key);
    }
  }
}

function plugin(
  id: string,
  matches: (
    data: unknown,
    row: Row,
    config: unknown,
    operand?: import("@/plugins").FilterValue,
  ) => boolean,
) {
  return {
    id,
    default: { name: id, icon: null, config: undefined, data: "" },
    meta: { name: id, desc: "", icon: null },
    fromValue: () => "",
    toValue: (value: string) => value,
    toTextValue: (value: string) => value,
    filtering: {
      operators: [
        { id: "matches", name: "Matches", operand: { kind: "text" }, matches },
      ],
    },
    renderCellValue: () => null,
  } as CellPlugin;
}

const properties = {
  title: { id: "title", name: "Title", type: "text", config: undefined },
  status: { id: "status", name: "Status", type: "select", config: undefined },
} as Record<string, ColumnInfo>;

describe("filter tree domain", () => {
  it("evaluates nested AND/OR groups without rendering React", () => {
    const matcher = vi.fn(
      (value: unknown, _row: Row, _config: unknown, operand: unknown) =>
        String(value).toLowerCase().includes(String(operand).toLowerCase()),
    );
    const plugins = {
      text: plugin("text", matcher as never),
      select: plugin("select", matcher as never),
    };
    const filter = group("root", "and", [
      rule("r1", "title", "matches", "alp"),
      group("nested", "or", [
        rule("r2", "status", "matches", "missing"),
        rule("r3", "status", "matches", "done"),
      ]),
    ]);

    expect(
      evaluateTableFilter(filter, row, properties, plugins, evaluationContext),
    ).toBe(true);
    expect(matcher).toHaveBeenCalledWith(
      expect.anything(),
      row,
      undefined,
      expect.anything(),
      evaluationContext,
    );
    expect(matcher).toHaveBeenCalledTimes(3);
  });

  it("short-circuits AND and OR groups", () => {
    const matcher = vi.fn(
      (value: unknown, _row: Row, _config: unknown, operand: unknown) =>
        value === operand,
    );
    const plugins = { text: plugin("text", matcher as never) };

    expect(
      evaluateTableFilter(
        group("and", "and", [
          rule("a", "title", "matches", "no"),
          rule("b", "title", "matches", "Alpha"),
        ]),
        row,
        properties,
        plugins,
        evaluationContext,
      ),
    ).toBe(false);
    expect(matcher).toHaveBeenCalledTimes(1);

    matcher.mockClear();
    expect(
      evaluateTableFilter(
        group("or", "or", [
          rule("a", "title", "matches", "Alpha"),
          rule("b", "title", "matches", "no"),
        ]),
        row,
        properties,
        plugins,
        evaluationContext,
      ),
    ).toBe(true);
    expect(matcher).toHaveBeenCalledTimes(1);
  });

  it("treats null and empty groups as pass-all", () => {
    expect(
      evaluateTableFilter(null, row, properties, {}, evaluationContext),
    ).toBe(true);
    expect(
      evaluateTableFilter(
        group("root", "or", []),
        row,
        properties,
        {},
        evaluationContext,
      ),
    ).toBe(true);
  });

  it.each([
    ["missing children", { kind: "group", id: "root", logic: "and" }],
    [
      "illegal logic",
      { kind: "group", id: "root", logic: "xor", children: [] },
    ],
    [
      "non-JSON operand",
      group("root", "and", [
        { ...rule("r", "title", "matches"), value: () => true } as never,
      ]),
    ],
  ])("fails closed without throwing for a malformed %s", (_case, state) => {
    expect(() =>
      evaluateTableFilter(
        state as never,
        row,
        properties,
        { text: plugin("text", (() => true) as never) },
        evaluationContext,
      ),
    ).not.toThrow();
    expect(
      evaluateTableFilter(
        state as never,
        row,
        properties,
        { text: plugin("text", (() => true) as never) },
        evaluationContext,
      ),
    ).toBe(false);
  });

  it("fails closed without throwing for a cyclic filter tree", () => {
    const cyclic = group("root", "and", []);
    cyclic.children.push(cyclic);

    expect(() =>
      evaluateTableFilter(cyclic, row, properties, {}, evaluationContext),
    ).not.toThrow();
    expect(
      evaluateTableFilter(cyclic, row, properties, {}, evaluationContext),
    ).toBe(false);
  });

  it("accepts three group levels and rejects a fourth or non-JSON values", () => {
    const level3 = group("three", "and", [
      rule("r", "title", "matches", "Alpha"),
    ]);
    const valid = group("one", "and", [group("two", "or", [level3])]);
    expect(validateTableFilterState(valid)).toBe(true);
    expect(validateTableFilterState(group("zero", "and", [valid]))).toBe(false);
    expect(
      validateTableFilterState(
        group("root", "and", [
          {
            ...rule("bad", "title", "matches"),
            value: { invalid: undefined },
          } as never,
        ]),
      ),
    ).toBe(false);
  });

  it("accepts a rule whose optional value is absent", () => {
    expect(
      validateTableFilterState(
        group("root", "and", [rule("r", "title", "matches")]),
      ),
    ).toBe(true);
  });

  it.each([
    ["extra rule field", { ...rule("r", "title", "matches"), extra: true }],
    ["extra group field", { ...group("root", "and", []), extra: true }],
    [
      "undefined rule field",
      { ...rule("r", "title", "matches"), extra: undefined },
    ],
    [
      "function rule field",
      { ...rule("r", "title", "matches"), extra: () => true },
    ],
    [
      "symbol group field",
      Object.assign(group("root", "and", []), { [Symbol("extra")]: true }),
    ],
  ])("rejects a node with an %s", (_case, node) => {
    const state =
      (node as { kind?: string }).kind === "group"
        ? node
        : group("root", "and", [node as never]);
    expect(() => validateTableFilterState(state)).not.toThrow();
    expect(validateTableFilterState(state)).toBe(false);
  });

  it.each([
    ["undefined", undefined],
    ["function", () => true],
    ["symbol", Symbol("operand")],
    ["NaN", Number.NaN],
    ["positive infinity", Number.POSITIVE_INFINITY],
    ["negative infinity", Number.NEGATIVE_INFINITY],
    ["sparse array", new Array(1)],
    ["array containing undefined", [undefined]],
  ])("rejects a %s operand without throwing", (_case, value) => {
    const state = group("root", "and", [
      { ...rule("r", "title", "matches"), value } as never,
    ]);
    expect(() => validateTableFilterState(state)).not.toThrow();
    expect(validateTableFilterState(state)).toBe(false);
  });

  it("rejects cyclic object and array operands without throwing", () => {
    const cyclicObject: Record<string, unknown> = {};
    cyclicObject.self = cyclicObject;
    const cyclicArray: unknown[] = [];
    cyclicArray.push(cyclicArray);

    for (const value of [cyclicObject, cyclicArray]) {
      const state = group("root", "and", [
        { ...rule("r", "title", "matches"), value } as never,
      ]);
      expect(() => validateTableFilterState(state)).not.toThrow();
      expect(validateTableFilterState(state)).toBe(false);
    }
  });

  it("accepts shared non-cyclic references and large JSON objects", () => {
    const shared = { nested: true };
    const large = Object.fromEntries(
      Array.from({ length: 2_000 }, (_, index) => [`key-${index}`, index]),
    );
    const state = group("root", "and", [
      {
        ...rule("r", "title", "matches"),
        value: { first: shared, second: shared, large },
      } as never,
    ]);

    expect(validateTableFilterState(state)).toBe(true);
  });

  it("rejects inherited required group fields from a polluted prototype", () => {
    withPrototypePollution(
      { kind: "group", id: "inherited", logic: "and" },
      () => {
        const state = { children: [] };
        expect(() => validateTableFilterState(state)).not.toThrow();
        expect(validateTableFilterState(state)).toBe(false);
      },
    );
  });

  it("rejects inherited required rule fields from a polluted prototype", () => {
    withPrototypePollution(
      {
        kind: "rule",
        id: "inherited",
        propertyId: "title",
        operator: "matches",
      },
      () => {
        const state = group("root", "and", [{} as never]);
        expect(() => validateTableFilterState(state)).not.toThrow();
        expect(validateTableFilterState(state)).toBe(false);
      },
    );
  });

  it("rejects accessor fields without invoking their getters", () => {
    const getter = vi.fn(() => {
      throw new Error("must not execute");
    });
    const state = {
      kind: "group",
      id: "root",
      logic: "and",
      get children() {
        return getter();
      },
    };

    expect(() => validateTableFilterState(state)).not.toThrow();
    expect(validateTableFilterState(state)).toBe(false);
    expect(getter).not.toHaveBeenCalled();
  });

  it("fails closed without throwing when an evaluator reaches an invalid date operand", () => {
    const datePlugin = createDate({
      icon: null,
      renderCellValue: () => null,
    });
    const dateRow = {
      ...row,
      properties: { due: { id: "due-cell", value: { start: 1 } } },
    } as Row;
    const dateProperties = {
      due: {
        id: "due",
        name: "Due",
        type: "date",
        config: { ...datePlugin.default.config, tz: "UTC" },
      },
    } as Record<string, ColumnInfo>;
    const state = group("root", "and", [
      {
        ...rule("date-rule", "due", "equals"),
        value: { timestamp: 1e308 },
      },
    ] as never);

    expect(() =>
      evaluateTableFilter(
        state,
        dateRow,
        dateProperties,
        { date: datePlugin },
        evaluationContext,
      ),
    ).not.toThrow();
    expect(
      evaluateTableFilter(
        state,
        dateRow,
        dateProperties,
        { date: datePlugin },
        evaluationContext,
      ),
    ).toBe(false);
  });

  it.each([
    "unknown property",
    "deleted property",
    "unknown plugin",
    "unsupported operator",
  ])("does not match an %s rule", (scenario) => {
    const nextProperties = structuredClone(properties);
    const plugins: Record<string, CellPlugin> = {
      text: plugin("text", (() => true) as never),
    };
    let propertyId = "title";
    let operator = "matches";
    if (scenario === "unknown property") propertyId = "missing";
    if (scenario === "deleted property") nextProperties.title!.isDeleted = true;
    if (scenario === "unknown plugin") nextProperties.title!.type = "missing";
    if (scenario === "unsupported operator") operator = "missing";

    expect(
      evaluateTableFilter(
        group("root", "and", [rule("r", propertyId, operator)]),
        row,
        nextProperties,
        plugins,
        evaluationContext,
      ),
    ).toBe(false);
  });
});
