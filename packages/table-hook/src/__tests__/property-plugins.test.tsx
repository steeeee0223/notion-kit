import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { appendFilterNode, createFilterRule } from "@/features";
import type { ColumnDefs, Row } from "@/lib/types";
import { arrayToEntity } from "@/lib/utils";
import {
  createdBy,
  id,
  lastEditedBy,
  location,
  number,
  person,
  relation,
  rollup,
  title,
  type RelationConfig,
  type RollupConfig,
} from "@/plugins";
import type { TablePropertySources } from "@/plugins/property-sources";
import { useTableView } from "@/table-contexts";
import { applyRelationChanges } from "@/table-contexts/relation-sync";

const plugins = arrayToEntity([
  title(),
  number(),
  id(),
  person(),
  createdBy(),
  lastEditedBy(),
  location(),
  relation(),
  rollup(),
]);

function row(
  id: string,
  values: Record<string, unknown> = {},
  createdAt = 0,
): Row {
  return {
    id,
    createdAt,
    lastEditedAt: createdAt,
    properties: Object.fromEntries(
      Object.entries(values).map(([propertyId, value]) => [
        propertyId,
        { id: `${id}-${propertyId}`, value },
      ]),
    ),
  };
}

function renderProperties(
  properties: ColumnDefs,
  data: Row[],
  propertySources?: TablePropertySources,
) {
  const { result, rerender } = renderHook(
    ({ propertySources }: { propertySources?: TablePropertySources }) =>
      useTableView({
        plugins,
        defaultProperties: properties,
        defaultData: data,
        propertySources,
      }),
    { initialProps: { propertySources } },
  );
  return { table: result.current.table, rerender };
}

const idProperty = {
  id: "serial",
  name: "ID",
  type: "id",
  config: { prefix: "TASK" },
};
const ada = { id: "ada", name: "Ada Lovelace" };
const grace = { id: "grace", name: "Grace Hopper" };

const sumConfig = {
  relationPropertyId: "related",
  targetPropertyId: "price",
  calculation: "sum",
  format: "number",
  round: "default",
} satisfies RollupConfig;

const rollupProperty = {
  id: "total",
  name: "Total",
  type: "rollup",
  config: sumConfig,
};

const relationProperty = {
  id: "related",
  name: "Related",
  type: "relation",
  config: {
    databaseId: "self",
    limit: "unlimited",
    reciprocalPropertyId: "reverse",
  } satisfies RelationConfig,
};

describe("New table property plugins", () => {
  it("assigns IDs by creation order and preserves the sequence after deletion, duplication, and prefix changes", () => {
    const { table } = renderProperties(
      [idProperty],
      [row("newer", {}, 1), row("older")],
    );
    expect(table.getCell("serial", "older").value).toEqual({
      number: 1,
      prefix: "TASK",
    });
    expect(table.getCell("serial", "newer").value).toEqual({
      number: 2,
      prefix: "TASK",
    });

    act(() => table.deleteRow("newer"));
    act(() => table.duplicateRow("older"));
    const [copy] = table.getCellValues().filter(({ id }) => id !== "older");
    expect(copy?.properties.serial?.value).toEqual({
      number: 3,
      prefix: "TASK",
    });

    act(() => table.getColumn("serial")?.updateConfig({ prefix: "ISSUE" }));
    expect(table.getCell("serial", "older").value).toEqual({
      number: 1,
      prefix: "ISSUE",
    });
    act(() => table.setGroupingColumn("serial"));
    expect(table.atoms.grouping.get()).toEqual([]);
    act(() =>
      table.setFilters(
        appendFilterNode(undefined, "", {
          ...createFilterRule("serial", "greater-than"),
          value: 1,
        }),
      ),
    );
    expect(table.getFilteredRowModel().rows.map(({ id }) => id)).toEqual([
      copy?.id,
    ]);
  });

  it("uses title-style grouping for people, matches stable IDs, and captures the actor when rows change", () => {
    const { table, rerender } = renderProperties(
      [
        { id: "owner", name: "Owner", type: "person" },
        { id: "creator", name: "Created by", type: "created-by" },
        { id: "editor", name: "Last edited by", type: "last-edited-by" },
      ],
      [row("first", { owner: [grace] }), row("second", { owner: [ada] })],
      { people: [ada, grace], currentActor: ada },
    );

    act(() => {
      table.setGroupingColumn("owner");
      table.setColumnGroupingMethod("owner", "alphabetical");
      table.setGroupSort({ mode: "ascending", method: "text" });
    });
    expect(
      table
        .getGroupedRowModel()
        .rows.map(({ id }) => table.getGroupingValue(id)),
    ).toEqual(["A", "G"]);
    act(() => table.setGroupingColumn(null));
    let added = "";
    act(() => {
      added = table.addRow({ initialValues: { owner: [ada, grace] } });
    });
    expect(table.getCell("creator", added).value).toEqual([ada]);

    rerender({
      propertySources: {
        people: [ada, { ...grace, name: "Rear Admiral Hopper" }],
        currentActor: grace,
      },
    });
    act(() => table.getColumn("owner")?.updateCell(added, [grace]));
    expect(table.getCell("editor", added).value).toEqual([
      { ...grace, name: "Rear Admiral Hopper" },
    ]);
    expect(table.getCell("creator", added).value).toEqual([ada]);
    act(() =>
      table.setFilters(
        appendFilterNode(undefined, "", {
          ...createFilterRule("owner", "contains"),
          value: [grace.id],
        }),
      ),
    );
    expect(table.getFilteredRowModel().rows.map(({ id }) => id)).toEqual([
      "first",
      added,
    ]);
  });

  it("synchronizes self-relations, recomputes rollups on target edits, and filters lists by the target operator", () => {
    const { table } = renderProperties(
      [
        { id: "title", name: "Name", type: "title" },
        { id: "price", name: "Price", type: "number" },
        relationProperty,
        {
          id: "reverse",
          name: "Referenced by",
          type: "relation",
          config: {
            databaseId: "self",
            limit: "unlimited",
            reciprocalPropertyId: "related",
          } satisfies RelationConfig,
        },
        rollupProperty,
      ],
      [
        row("source", { title: "Order" }),
        row("target", { title: "Item", price: "18" }),
      ],
    );

    act(() =>
      table
        .getColumn("related")
        ?.updateCell("source", [{ id: "target", name: "Item" }]),
    );
    expect(table.getCell("reverse", "target").value).toEqual([
      { id: "source", name: "Order" },
    ]);
    expect(table.getCell("total", "source").value).toMatchObject({
      kind: "number",
      value: 18,
    });
    act(() => table.getColumn("price")?.updateCell("target", "25"));
    expect(table.getCell("total", "source").value).toMatchObject({
      kind: "number",
      value: 25,
    });

    act(() =>
      table
        .getColumn("total")
        ?.updateConfig({ ...sumConfig, calculation: "original" }),
    );
    expect(table.getColumn("total")?.getCanSort()).toBe(false);
    act(() =>
      table.setFilters(
        appendFilterNode(undefined, "", {
          ...createFilterRule("total", "list-any"),
          value: { operator: "greater-than", value: 20 },
        }),
      ),
    );
    expect(table.getFilteredRowModel().rows.map(({ id }) => id)).toEqual([
      "source",
    ]);
    act(() => table.getColumn("related")?.updateCell("source", []));
    expect(table.getCell("reverse", "target").value).toEqual([]);
    expect(table.getFilteredRowModel().rows).toHaveLength(0);
  });

  it("emits accepted cross-database changes and applies a reciprocal update only once", () => {
    const onRelationChanges =
      vi.fn<NonNullable<TablePropertySources["onRelationChanges"]>>();
    const target = row("target", { title: "Item" });
    const { table } = renderProperties(
      [
        {
          ...relationProperty,
          config: { ...relationProperty.config, databaseId: "catalog" },
        },
      ],
      [row("source")],
      { databaseId: "orders", onRelationChanges },
    );

    act(() =>
      table
        .getColumn("related")
        ?.updateCell("source", [{ id: "target", name: "Item" }]),
    );
    const changes = onRelationChanges.mock.calls[0]?.[0] ?? [];
    expect(changes).toEqual([
      {
        sourceDatabaseId: "orders",
        sourcePropertyId: "related",
        targetDatabaseId: "catalog",
        targetPropertyId: "reverse",
        sourceRowId: "source",
        previousRowIds: [],
        nextRowIds: ["target"],
      },
    ]);
    const updated = applyRelationChanges([target], changes);
    expect(updated[0]?.properties.reverse?.value).toEqual([
      { id: "source", name: "" },
    ]);
    expect(applyRelationChanges(updated, changes)).toEqual(updated);
  });
});
