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
import {
  useTableView,
  type DataResourceAction,
  type ResourceChangeHandler,
} from "@/table-contexts";
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
  });

  it("keeps the creator and resolves the latest editor from the current directory", () => {
    const { table, rerender } = renderProperties(
      [
        { id: "owner", name: "Owner", type: "person" },
        { id: "creator", name: "Created by", type: "created-by" },
        { id: "editor", name: "Last edited by", type: "last-edited-by" },
      ],
      [],
      { people: [ada, grace], currentActor: ada },
    );

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
  });

  it("persists bulk person edits on rows that have no stored person cell", () => {
    const onDataChange =
      vi.fn<ResourceChangeHandler<Row[], DataResourceAction>>();
    const { result } = renderHook(() =>
      useTableView({
        plugins,
        defaultProperties: [{ id: "owner", name: "Owner", type: "person" }],
        defaultData: [row("first"), row("second"), row("unselected")],
        onDataChange,
      }),
    );

    act(() =>
      result.current.table
        .getColumn("owner")
        ?.updateCells(["first", "second"], [ada]),
    );

    const change = onDataChange.mock.lastCall?.[0];
    expect(change?.action).toMatchObject({
      type: "data.cell.update",
      payload: { propertyId: "owner", rowIds: ["first", "second"] },
    });
    expect(
      change?.next.map(({ id, properties }): [string, unknown] => [
        id,
        properties.owner?.value,
      ]),
    ).toEqual([
      ["first", [ada]],
      ["second", [ada]],
      ["unselected", undefined],
    ]);
  });

  it("applies the relation limit when creating a row with initial links", () => {
    const { table } = renderProperties(
      [{ ...relationProperty, config: { databaseId: "self", limit: "one" } }],
      [row("first"), row("second")],
    );

    let id = "";
    act(() => {
      id = table.addRow({
        initialValues: {
          related: [
            { id: "first", name: "First" },
            { id: "second", name: "Second" },
          ],
        },
      });
    });

    expect(table.getCell("related", id).value).toEqual([
      { id: "first", name: "Untitled" },
    ]);
  });

  it("does not reuse a row number after a controlled deletion", () => {
    const onDataChange = vi.fn();
    const first = { ...row("first"), sequence: 2 };
    const last = { ...row("last"), sequence: 9 };
    const { result, rerender } = renderHook(
      (data: Row[]) =>
        useTableView({
          plugins,
          defaultProperties: [idProperty],
          data,
          onDataChange,
        }),
      { initialProps: [first, last] },
    );

    rerender([first]);
    act(() => {
      result.current.table.addRow();
    });

    expect(onDataChange).toHaveBeenCalledWith(
      expect.objectContaining({
        next: [first, expect.objectContaining({ sequence: 10 })],
      }),
    );
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
    expect(applyRelationChanges(updated, changes)).toBe(updated);
  });
});

it("uses the Person creator default only when a new row has no explicit assignment", () => {
  const ada = { id: "ada", name: "Ada Lovelace" };
  const columns: ColumnDefs = [
    { id: "title", name: "Name", type: "title" },
    {
      id: "owner",
      name: "Person",
      type: "person",
      config: {
        limit: "one",
        defaultValue: "created-by",
        notifications: "individuals",
      },
    },
  ];
  const { result } = renderHook(() =>
    useTableView({
      plugins,
      defaultProperties: columns,
      defaultData: [],
      propertySources: { currentActor: ada },
    }),
  );
  const { table } = result.current;

  act(() => {
    table.addRow({ initialValues: { title: "Uses default" } });
    table.addRow({ initialValues: { title: "Explicitly empty", owner: [] } });
  });

  expect(
    table.getCellValues().map((row): unknown => row.properties.owner?.value),
  ).toEqual([[ada], []]);
});
