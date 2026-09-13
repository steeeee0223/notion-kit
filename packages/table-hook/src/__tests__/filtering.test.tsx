import { describe, expect, it, vi } from "vitest";

import {
  evaluateTableFilter,
  validateTableFilterState,
  type FilterGroup,
} from "@/features/filtering";
import type { ColumnInfo, Row } from "@/lib/types";
import type { CellPlugin } from "@/plugins";

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
    default: { config: undefined, data: "" },
    fromValue: () => "",
    toValue: (value: string) => value,
    isEmpty: (value: string) => value.trim() === "",
    toTextValue: (value: string) => value,
    filtering: {
      operators: [
        { id: "matches", name: "Matches", operand: { kind: "text" }, matches },
      ],
    },
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
