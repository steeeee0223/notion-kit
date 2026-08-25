import { useState } from "react";
import {
  createPaginatedRowModel,
  functionalUpdate,
  rowPaginationFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_FEATURES, type TableFeatures } from "@/features";
import type { FilterGroup, TableFilterState } from "@/features/filtering";
import type { TableViewState } from "@/features/menu";
import type { ColumnInfo, Row } from "@/lib/types";
import { arrayToEntity } from "@/lib/utils";
import type { CellPlugin, FilterEvaluationContext } from "@/plugins";
import type {
  ResourceChangeHandler,
  ViewResourceAction,
} from "@/table-contexts";
import { useTableView } from "@/table-contexts/use-table-view";

function createTextPlugin(
  id: string,
  toTextValue: (value: string) => string = (value) => value,
): CellPlugin<string, string, undefined> {
  return {
    id,
    meta: { name: id, desc: id, icon: null },
    default: { name: id, icon: null, data: "", config: undefined },
    fromValue: (value) => value?.toString() ?? "",
    toValue: (value) => value,
    toTextValue,
    filtering: {
      operators: [
        {
          id: "contains",
          name: "Contains",
          operand: { kind: "text" },
          matches: (value, _row, _config, operand) =>
            typeof operand === "string" &&
            (value ?? "").toLowerCase().includes(operand.toLowerCase()),
        },
      ],
    },
    renderCellValue: () => null,
  };
}

function createNumberPlugin(
  receivedContexts?: FilterEvaluationContext[],
): CellPlugin<string, number, undefined> {
  return {
    id: "score",
    meta: { name: "Score", desc: "Score", icon: null },
    default: { name: "Score", icon: null, data: 0, config: undefined },
    fromValue: (value) => Number(value),
    toValue: (value) => value,
    toTextValue: (value) => String(value),
    filtering: {
      operators: [
        {
          id: "greater-than",
          name: "Greater than",
          operand: { kind: "number" },
          matches: (value, _row, _config, operand, context) => {
            receivedContexts?.push(context);
            return typeof operand === "number" && (value ?? 0) > operand;
          },
        },
      ],
    },
    renderCellValue: () => null,
  };
}

const properties: ColumnInfo[] = [
  { id: "name", name: "Name", type: "search", config: undefined },
  { id: "score", name: "Score", type: "score", config: undefined },
  { id: "city", name: "City", type: "city", config: undefined },
  {
    id: "deleted",
    name: "Deleted",
    type: "search",
    config: undefined,
    isDeleted: true,
  },
];

const data: Row[] = [
  {
    id: "john",
    createdAt: 0,
    lastEditedAt: 0,
    properties: {
      name: { id: "john-name", value: "John" },
      score: { id: "john-score", value: 25 },
      city: { id: "john-city", value: "New York" },
      deleted: { id: "john-deleted", value: "secret-john" },
    },
  },
  {
    id: "bob",
    createdAt: 0,
    lastEditedAt: 0,
    properties: {
      name: { id: "bob-name", value: "Bob" },
      score: { id: "bob-score", value: 30 },
      city: { id: "bob-city", value: "New York" },
      deleted: { id: "bob-deleted", value: "secret-bob" },
    },
  },
  {
    id: "alice",
    createdAt: 0,
    lastEditedAt: 0,
    properties: {
      name: { id: "alice-name", value: "Alice" },
      score: { id: "alice-score", value: 40 },
      city: { id: "alice-city", value: "London" },
      deleted: { id: "alice-deleted", value: "secret-alice" },
    },
  },
  {
    id: "charlie",
    createdAt: 0,
    lastEditedAt: 0,
    properties: {
      name: { id: "charlie-name", value: "Charlie" },
      score: { id: "charlie-score", value: 10 },
      city: { id: "charlie-city", value: "New York" },
      deleted: { id: "charlie-deleted", value: "secret-charlie" },
    },
  },
];

function scoreFilter(value: number): TableFilterState {
  return {
    kind: "group",
    id: "root",
    logic: "and",
    children: [
      {
        kind: "group",
        id: "nested",
        logic: "or",
        children: [
          {
            kind: "rule",
            id: "score-rule",
            propertyId: "score",
            operator: "greater-than",
            value,
          },
        ],
      },
    ],
  };
}

function renderFilteringTable(options?: {
  filters?: TableFilterState;
  onViewChange?: ResourceChangeHandler<TableViewState, ViewResourceAction>;
  receivedContexts?: FilterEvaluationContext[];
}) {
  const plugins = arrayToEntity([
    createTextPlugin("search", (value) => `indexed:${value}`),
    createNumberPlugin(options?.receivedContexts),
    createTextPlugin("city", (value) => `indexed:${value}`),
  ]);
  return renderHook(() =>
    useTableView({
      plugins,
      defaultData: data,
      defaultProperties: properties,
      defaultView: { filters: options?.filters },
      onViewChange: options?.onViewChange,
    }),
  );
}

function renderControlledSearchTable({
  initialProperties = properties,
  initialPlugins,
}: {
  initialProperties?: ColumnInfo[];
  initialPlugins: CellPlugin[];
}) {
  return renderHook(
    ({ currentProperties, currentPlugins }) =>
      useTableView({
        plugins: arrayToEntity(currentPlugins),
        data,
        properties: currentProperties,
      }),
    {
      initialProps: {
        currentProperties: initialProperties,
        currentPlugins: initialPlugins,
      },
    },
  );
}

interface NestedRow extends Row {
  subRows?: NestedRow[];
}

function renderNestedFilteringTable({
  rows,
  filters,
  filterFromLeafRows,
  maxLeafRowFilterDepth,
  columnFilters,
}: {
  rows: NestedRow[];
  filters: TableFilterState;
  filterFromLeafRows?: boolean;
  maxLeafRowFilterDepth?: number;
  columnFilters?: { id: string; value: unknown }[];
}) {
  const nestedPlugin = createTextPlugin("nested");
  const nestedProperties = {
    value: {
      id: "value",
      name: "Value",
      type: "nested",
      config: undefined,
    },
  } satisfies Record<string, ColumnInfo>;
  const columns: ColumnDef<TableFeatures, NestedRow>[] = [
    {
      id: "value",
      accessorFn: (row) => row.properties.value?.value as string | undefined,
      enableGlobalFilter: true,
      filterFn: (row, propertyId, filterValue, addMeta) => {
        addMeta?.({ source: "column-filter" });
        return String(row.getValue(propertyId)).includes(String(filterValue));
      },
    },
  ];
  return renderHook(() =>
    useTable<TableFeatures, NestedRow, null>(
      {
        features: DEFAULT_FEATURES,
        columns,
        data: rows,
        getRowId: (row) => row.id,
        getSubRows: (row) => row.subRows,
        filterFromLeafRows,
        maxLeafRowFilterDepth,
        initialState: { columnFilters },
        globalFilterFn: "pluginTextIncludes",
        state: {
          columnsInfo: nestedProperties,
          cellPlugins: { nested: nestedPlugin },
          tableGlobal: {
            layout: "table",
            rowView: "side",
            openedRowId: null,
            filters,
          },
        },
      },
      () => null,
    ),
  );
}

function nestedRow(
  id: string,
  value: string,
  subRows?: NestedRow[],
): NestedRow {
  return {
    id,
    createdAt: 0,
    lastEditedAt: 0,
    properties: { value: { id: `${id}-value`, value } },
    subRows,
  };
}

const nestedContainsFilter = {
  kind: "group",
  id: "nested-root",
  logic: "and",
  children: [
    {
      kind: "rule",
      id: "nested-rule",
      propertyId: "value",
      operator: "contains",
      value: "match",
    },
  ],
} as const satisfies FilterGroup;

const PAGINATED_FEATURES = tableFeatures({
  ...DEFAULT_FEATURES,
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

function renderPaginatedFilteringTable() {
  const nestedPlugin = createTextPlugin("nested");
  const nestedProperties = {
    value: {
      id: "value",
      name: "Value",
      type: "nested",
      config: undefined,
    },
  } satisfies Record<string, ColumnInfo>;
  const rows = [
    nestedRow("one", "match"),
    nestedRow("two", "other"),
    nestedRow("three", "match"),
    nestedRow("four", "other"),
  ];
  const columns: ColumnDef<typeof PAGINATED_FEATURES, NestedRow>[] = [
    {
      id: "value",
      accessorFn: (row) => row.properties.value?.value as string | undefined,
      enableGlobalFilter: true,
      filterFn: (row, propertyId, filterValue) =>
        String(row.getValue(propertyId)).includes(String(filterValue)),
    },
  ];
  return renderHook(() => {
    const [tableGlobal, setTableGlobal] = useState<TableViewState>({
      layout: "table",
      rowView: "side",
      openedRowId: null,
    });
    return useTable<typeof PAGINATED_FEATURES, NestedRow, null>(
      {
        features: PAGINATED_FEATURES,
        columns,
        data: rows,
        getRowId: (row) => row.id,
        globalFilterFn: "pluginTextIncludes",
        initialState: { pagination: { pageIndex: 2, pageSize: 1 } },
        state: {
          columnsInfo: nestedProperties,
          cellPlugins: { nested: nestedPlugin },
          tableGlobal,
        },
        onTableGlobalChange: (updater) => {
          setTableGlobal((previous) => functionalUpdate(updater, previous));
        },
      },
      () => null,
    );
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useTableView filtering pipeline", () => {
  it("GlobalSearch_UsesPluginTextAndNeverMutatesTheViewResource", () => {
    const onViewChange = vi.fn();
    const { result } = renderFilteringTable({ onViewChange });
    const initialView = result.current.table.getTableGlobalState();

    act(() => result.current.table.setGlobalFilter("INDEXED:JOHN"));

    expect(result.current.table.atoms.globalFilter.get()).toBe("INDEXED:JOHN");
    expect(
      result.current.table.getFilteredRowModel().rows.map((row) => row.id),
    ).toEqual(["john"]);
    expect(result.current.table.getTableGlobalState()).toBe(initialView);
    expect(onViewChange).not.toHaveBeenCalled();

    act(() => result.current.table.setGlobalFilter("secret"));
    expect(result.current.table.getFilteredRowModel().rows).toEqual([]);

    act(() => result.current.table.resetGlobalFilter());
    expect(result.current.table.getFilteredRowModel().rows).toHaveLength(4);
  });

  it("FilteringPipeline_ComposesSearchThenAdvancedFilteringBeforeGroupingAndSorting", () => {
    const { result } = renderFilteringTable({ filters: scoreFilter(20) });
    const table = result.current.table;

    act(() => {
      table.setGlobalFilter("indexed:new york");
      table.setGrouping(["city"]);
      table.setSorting([{ id: "score", desc: true }]);
    });

    expect(table.getFilteredRowModel().rows.map((row) => row.id)).toEqual([
      "john",
      "bob",
    ]);
    const groupedRows = table.getSortedRowModel().rows;
    expect(groupedRows).toHaveLength(1);
    expect(groupedRows[0]?.groupingValue).toBe("New York");
    expect(groupedRows[0]?.subRows.map((row) => row.id)).toEqual([
      "bob",
      "john",
    ]);
  });

  it("AdvancedFiltering_InvalidDefaultViewFailsClosedWithoutThrowing", () => {
    const malformed = { kind: "group", id: "bad", logic: "and" };
    const { result } = renderFilteringTable({ filters: malformed as never });

    expect(() => result.current.table.getFilteredRowModel()).not.toThrow();
    expect(result.current.table.getFilteredRowModel().rows).toEqual([]);
  });

  it("AdvancedFiltering_InvalidControlledViewFailsClosedWithoutThrowing", () => {
    const cyclic = {
      kind: "group",
      id: "bad",
      logic: "and",
      children: [] as unknown[],
    };
    cyclic.children.push(cyclic);
    const plugins = arrayToEntity([
      createTextPlugin("search"),
      createNumberPlugin(),
      createTextPlugin("city"),
    ]);
    const { result } = renderHook(() =>
      useTableView({
        plugins,
        data,
        properties,
        view: { filters: cyclic as never },
      }),
    );

    expect(() => result.current.table.getFilteredRowModel()).not.toThrow();
    expect(result.current.table.getFilteredRowModel().rows).toEqual([]);
  });

  it("AdvancedFiltering_CapturesNowOnceAndReusesTheContextForEveryRow", () => {
    const receivedContexts: FilterEvaluationContext[] = [];
    const { result } = renderFilteringTable({
      filters: scoreFilter(20),
      receivedContexts,
    });
    const now = vi
      .spyOn(Date, "now")
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(200);
    receivedContexts.length = 0;

    act(() => result.current.table.setFilters(scoreFilter(21)));

    expect(
      result.current.table.getFilteredRowModel().rows.map((row) => row.id),
    ).toEqual(["john", "bob", "alice"]);
    expect(now).toHaveBeenCalledTimes(1);
    expect(receivedContexts).toHaveLength(4);
    expect(
      receivedContexts.every((context) => context === receivedContexts[0]),
    ).toBe(true);
    expect(receivedContexts.map(({ now }) => now)).toEqual([
      100, 100, 100, 100,
    ]);
  });

  it("GlobalSearch_RecomputesWhenAnActivePropertyBecomesDeleted", () => {
    const searchPlugin = createTextPlugin(
      "search",
      (value) => `indexed:${value}`,
    );
    const { result, rerender } = renderControlledSearchTable({
      initialPlugins: [
        searchPlugin,
        createNumberPlugin(),
        createTextPlugin("city"),
      ],
    });

    act(() => result.current.table.setGlobalFilter("indexed:john"));
    expect(
      result.current.table.getFilteredRowModel().rows.map(({ id }) => id),
    ).toEqual(["john"]);

    rerender({
      currentProperties: properties.map((property) =>
        property.id === "name" ? { ...property, isDeleted: true } : property,
      ),
      currentPlugins: [
        searchPlugin,
        createNumberPlugin(),
        createTextPlugin("city"),
      ],
    });

    expect(result.current.table.getFilteredRowModel().rows).toEqual([]);
  });

  it("GlobalSearch_RecomputesWhenAPropertyPluginTypeChanges", () => {
    const indexedPlugin = createTextPlugin(
      "search",
      (value) => `indexed:${value}`,
    );
    const plainPlugin = createTextPlugin("plain", (value) => `plain:${value}`);
    const allPlugins = [
      indexedPlugin,
      plainPlugin,
      createNumberPlugin(),
      createTextPlugin("city"),
    ];
    const { result, rerender } = renderControlledSearchTable({
      initialPlugins: allPlugins,
    });

    act(() => result.current.table.setGlobalFilter("indexed:john"));
    expect(
      result.current.table.getFilteredRowModel().rows.map(({ id }) => id),
    ).toEqual(["john"]);

    rerender({
      currentProperties: properties.map((property) =>
        property.id === "name" ? { ...property, type: "plain" } : property,
      ),
      currentPlugins: allPlugins,
    });

    expect(result.current.table.getFilteredRowModel().rows).toEqual([]);
  });

  it("GlobalSearch_RecomputesWhenPluginTextConversionChanges", () => {
    const initialPlugins = [
      createTextPlugin("search", (value) => `before:${value}`),
      createNumberPlugin(),
      createTextPlugin("city"),
    ];
    const { result, rerender } = renderControlledSearchTable({
      initialPlugins,
    });

    act(() => result.current.table.setGlobalFilter("before:john"));
    expect(
      result.current.table.getFilteredRowModel().rows.map(({ id }) => id),
    ).toEqual(["john"]);

    rerender({
      currentProperties: properties,
      currentPlugins: [
        createTextPlugin("search", (value) => `after:${value}`),
        createNumberPlugin(),
        createTextPlugin("city"),
      ],
    });

    expect(result.current.table.getFilteredRowModel().rows).toEqual([]);
  });

  it("GlobalSearch_SurfacesPluginTextConversionErrors", () => {
    const throwingPlugin = createTextPlugin("search", () => {
      throw new Error("broken toTextValue");
    });
    const { result } = renderControlledSearchTable({
      initialPlugins: [
        throwingPlugin,
        createNumberPlugin(),
        createTextPlugin("city"),
      ],
    });

    act(() => result.current.table.setGlobalFilter("query"));

    expect(() => result.current.table.getFilteredRowModel()).toThrow(
      "broken toTextValue",
    );
  });

  it("AdvancedFiltering_RootFirstDropsAParentWhoseChildAloneMatches", () => {
    const { result } = renderNestedFilteringTable({
      rows: [nestedRow("parent", "no", [nestedRow("child", "match")])],
      filters: nestedContainsFilter,
    });

    expect(result.current.getFilteredRowModel().rows).toEqual([]);
  });

  it("AdvancedFiltering_LeafFirstKeepsAParentAndOnlyItsMatchingChildren", () => {
    const { result } = renderNestedFilteringTable({
      rows: [
        nestedRow("parent", "no", [
          nestedRow("matching-child", "match"),
          nestedRow("other-child", "no"),
        ]),
      ],
      filters: nestedContainsFilter,
      filterFromLeafRows: true,
    });

    const model = result.current.getFilteredRowModel();
    expect(model.rows.map(({ id }) => id)).toEqual(["parent"]);
    expect(model.rows[0]?.subRows.map(({ id }) => id)).toEqual([
      "matching-child",
    ]);
    expect(model.flatRows.map(({ id }) => id)).toEqual([
      "matching-child",
      "parent",
    ]);
  });

  it("FilteringPipeline_LeafFirstRequiresGlobalAndAdvancedFiltersToMatchTheSameRow", () => {
    const { result } = renderNestedFilteringTable({
      rows: [nestedRow("parent", "match", [nestedRow("child", "search")])],
      filters: nestedContainsFilter,
      filterFromLeafRows: true,
    });

    act(() => result.current.setGlobalFilter("search"));

    const model = result.current.getFilteredRowModel();
    expect(model.rows).toEqual([]);
    expect(model.flatRows).toEqual([]);
    expect(Object.keys(model.rowsById)).toEqual([]);
  });

  it("FilteringPipeline_LeafFirstKeepsAChildThatMatchesGlobalAndAdvancedFilters", () => {
    const { result } = renderNestedFilteringTable({
      rows: [nestedRow("parent", "no", [nestedRow("child", "match search")])],
      filters: nestedContainsFilter,
      filterFromLeafRows: true,
    });

    act(() => result.current.setGlobalFilter("search"));

    const model = result.current.getFilteredRowModel();
    expect(model.rows.map(({ id }) => id)).toEqual(["parent"]);
    expect(model.rows[0]?.subRows.map(({ id }) => id)).toEqual(["child"]);
    expect(model.flatRows.map(({ id }) => id)).toEqual(["child", "parent"]);
    expect(Object.keys(model.rowsById).sort()).toEqual(["child", "parent"]);
  });

  it("FilteringPipeline_LeafFirstRequiresColumnAndAdvancedFiltersToMatchTheSameRow", () => {
    const { result } = renderNestedFilteringTable({
      rows: [nestedRow("parent", "match", [nestedRow("child", "search")])],
      filters: nestedContainsFilter,
      filterFromLeafRows: true,
      columnFilters: [{ id: "value", value: "search" }],
    });

    const model = result.current.getFilteredRowModel();
    expect(model.rows).toEqual([]);
    expect(model.flatRows).toEqual([]);
    expect(Object.keys(model.rowsById)).toEqual([]);
  });

  it("AdvancedFiltering_HonorsMaxDepthAndKeepsDeeperDescendantsUnfiltered", () => {
    const child = nestedRow("child", "no");
    const parent = nestedRow("parent", "match", [child]);
    const { result } = renderNestedFilteringTable({
      rows: [parent],
      filters: nestedContainsFilter,
      maxLeafRowFilterDepth: 0,
    });

    const model = result.current.getFilteredRowModel();
    expect(model.rows[0]?.subRows[0]?.original).toBe(child);
    expect(model.flatRows.map(({ id }) => id)).toEqual(["parent", "child"]);
    expect(model.rowsById.child?.original).toBe(child);
  });

  it("AdvancedFiltering_LeafFirstMaxDepthExcludesUnvisitedDescendantsFromTheWholeModel", () => {
    const child = nestedRow("child", "match");
    const parent = nestedRow("parent", "match", [child]);
    const { result } = renderNestedFilteringTable({
      rows: [parent],
      filters: nestedContainsFilter,
      filterFromLeafRows: true,
      maxLeafRowFilterDepth: 0,
    });

    const model = result.current.getFilteredRowModel();
    expect(model.rows.map(({ id }) => id)).toEqual(["parent"]);
    expect(model.rows[0]?.subRows).toEqual([]);
    expect(model.flatRows.map(({ id }) => id)).toEqual(["parent"]);
    expect(model.rowsById.parent?.original).toBe(parent);
    expect(Object.hasOwn(model.rowsById, "child")).toBe(false);
  });

  it("AdvancedFiltering_UsesANullPrototypeRowsByIdForDangerousRowIds", () => {
    const rows = ["__proto__", "constructor", "hasOwnProperty"].map((id) =>
      nestedRow(id, "match"),
    );
    const { result } = renderNestedFilteringTable({
      rows,
      filters: nestedContainsFilter,
    });

    const { rowsById } = result.current.getFilteredRowModel();
    expect(Reflect.getPrototypeOf(rowsById)).toBeNull();
    for (const row of rows) {
      expect(Object.hasOwn(rowsById, row.id)).toBe(true);
      expect(rowsById[row.id]?.original).toBe(row);
    }
  });

  it("FilteringPipeline_PreservesNativeColumnFiltersAndTheirMetadata", () => {
    const { result } = renderNestedFilteringTable({
      rows: [nestedRow("matching", "match"), nestedRow("other", "no")],
      filters: null,
      columnFilters: [{ id: "value", value: "match" }],
    });

    const model = result.current.getFilteredRowModel();
    expect(model.rows.map(({ id }) => id)).toEqual(["matching"]);
    expect(model.rows[0]?.columnFilters.value).toBe(true);
    expect(model.rows[0]?.columnFiltersMeta.value).toEqual({
      source: "column-filter",
    });
  });

  it.each(["global", "column", "advanced"] as const)(
    "FilteringPipeline_%sFilterChangeAutoResetsPaginationButInitialComputationDoesNot",
    async (filterKind) => {
      const { result } = renderPaginatedFilteringTable();

      await act(async () => {
        result.current.getFilteredRowModel();
        await Promise.resolve();
      });
      expect(result.current.atoms.pagination.get().pageIndex).toBe(2);

      act(() => {
        if (filterKind === "global") {
          result.current.setGlobalFilter("match");
        } else if (filterKind === "column") {
          result.current.setColumnFilters([{ id: "value", value: "match" }]);
        } else {
          result.current.setFilters(nestedContainsFilter);
        }
      });
      await act(async () => {
        result.current.getFilteredRowModel();
        await Promise.resolve();
      });

      expect(result.current.atoms.pagination.get().pageIndex).toBe(0);
    },
  );
});
