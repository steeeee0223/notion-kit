import { describe, expect, it } from "vitest";

import {
  appendFilterNode,
  countFilterRules,
  createFilterGroup,
  createFilterRule,
  removeFilterNode,
  updateFilterNode,
  type FilterGroup,
  type FilterRule,
} from "@/features/filtering";

const rule1 = {
  kind: "rule",
  id: "rule-1",
  propertyId: "title",
  operator: "contains",
  value: "first",
} satisfies FilterRule;

const rule2 = {
  kind: "rule",
  id: "rule-2",
  propertyId: "status",
  operator: "is",
  value: "open",
} satisfies FilterRule;

const rule3 = {
  kind: "rule",
  id: "rule-3",
  propertyId: "priority",
  operator: "is",
  value: "high",
} satisfies FilterRule;

const rule4 = {
  kind: "rule",
  id: "rule-4",
  propertyId: "owner",
  operator: "is-not-empty",
} satisfies FilterRule;

const deep = {
  kind: "group",
  id: "deep",
  logic: "or",
  children: [rule3, rule4],
} satisfies FilterGroup;

const nested = {
  kind: "group",
  id: "nested",
  logic: "and",
  children: [rule2, deep],
} satisfies FilterGroup;

const tree = {
  kind: "group",
  id: "root",
  logic: "or",
  children: [rule1, nested],
} satisfies FilterGroup;

describe("filter tree", () => {
  it("counts rules recursively and treats nullish state as empty", () => {
    expect(countFilterRules(tree)).toBe(4);
    expect(countFilterRules(null)).toBe(0);
    expect(countFilterRules(undefined)).toBe(0);
  });

  it("treats malformed runtime state as inactive", () => {
    expect(
      countFilterRules({ kind: "group", id: "missing-children", logic: "and" }),
    ).toBe(0);
  });

  it("appends to a nested group while preserving untouched siblings", () => {
    const newRule = {
      kind: "rule",
      id: "rule-5",
      propertyId: "due",
      operator: "is-empty",
    } satisfies FilterRule;

    const appended = appendFilterNode(tree, "nested", newRule);

    expect(appended).not.toBeNull();
    expect(appended).not.toBe(tree);
    expect(appended?.children[0]).toBe(rule1);
    expect((appended?.children[1] as FilterGroup).children).toEqual([
      rule2,
      deep,
      newRule,
    ]);
  });

  it("creates an and root when appending to nullish state", () => {
    const appended = appendFilterNode(undefined, "ignored", rule1);

    expect(appended).toMatchObject({
      kind: "group",
      logic: "and",
      children: [rule1],
    });
  });

  it("updates a deeply nested node while preserving untouched branches", () => {
    const updated = updateFilterNode(tree, "rule-3", (node) =>
      node.kind === "rule" ? { ...node, operator: "is-empty" } : node,
    );

    expect(updated?.children[0]).toBe(rule1);
    const updatedDeep = (updated?.children[1] as FilterGroup)
      .children[1] as FilterGroup;
    expect(updatedDeep.children[0]).toMatchObject({
      id: "rule-3",
      operator: "is-empty",
    });
    expect(updatedDeep.children[1]).toBe(rule4);
  });

  it("removes a deeply nested node while preserving untouched siblings", () => {
    const removed = removeFilterNode(tree, "rule-3");

    expect(removed?.children[0]).toBe(rule1);
    const removedDeep = (removed?.children[1] as FilterGroup)
      .children[1] as FilterGroup;
    expect(removedDeep.children).toEqual([rule4]);
  });

  it("returns null when removing the final root rule", () => {
    expect(
      removeFilterNode(
        {
          kind: "group",
          id: "single-root",
          logic: "and",
          children: [rule1],
        },
        "rule-1",
      ),
    ).toBeNull();
  });

  it("retains an empty nested group until it is explicitly removed", () => {
    const withEmptyNested = removeFilterNode(
      {
        kind: "group",
        id: "empty-test-root",
        logic: "and",
        children: [rule1, { ...deep, children: [rule3] }],
      },
      "rule-3",
    );

    expect(withEmptyNested?.children[1]).toMatchObject({
      kind: "group",
      id: "deep",
      children: [],
    });
    expect(removeFilterNode(withEmptyNested, "deep")?.children).toEqual([
      rule1,
    ]);
  });

  it("creates groups and rules with v4 UUIDs", () => {
    const group = createFilterGroup();
    const rule = createFilterRule("status", "is");

    expect(group).toMatchObject({ kind: "group", logic: "and", children: [] });
    expect(rule).toMatchObject({
      kind: "rule",
      propertyId: "status",
      operator: "is",
    });
    expect(rule).not.toHaveProperty("value");
    expect(group.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(rule.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
