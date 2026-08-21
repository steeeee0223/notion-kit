import { act, renderHook } from "@testing-library/react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";

import {
  getDefaultGroupingValue,
  type CellPlugin,
} from "@notion-kit/table-hook/plugins";

import { DEFAULT_FEATURES } from "@/features";
import type { _RowInstance } from "@/features/types";
import { sortBooleans, sortNumbers, sortStrings } from "@/fns";
import type { ColumnInfo, Row } from "@/lib/types";
import { arrayToEntity } from "@/lib/utils";
import {
  compareNumbers,
  compareStrings,
  createSortingMethod,
  getGroupSortableSortingMethods,
  isValueSortingMethod,
  resolveGroupingMethod,
  resolveGroupSortingMethod,
  resolveSortingMethod,
} from "@/methods";
import { createCompareFn } from "@/plugins/utils";
import type { PartialTableViewState } from "@/table-contexts/types";
import { useTableView } from "@/table-contexts/use-table-view";

const reverseTextPlugin: CellPlugin<"reverse-text", string, undefined> = {
  id: "reverse-text",
  meta: {
    name: "Reverse Text",
    desc: "Reverse Text",
    icon: null,
  },
  default: {
    name: "Reverse Text",
    icon: null,
    config: undefined,
    data: "",
  },
  fromValue: (value) => value?.toString() ?? "",
  toValue: (data) => data,
  toTextValue: (data) => data,
  sorting: {
    defaultMethod: "reverse-alpha",
    methods: [
      {
        id: "reverse-alpha",
        name: "Reverse alphabetical",
        function: (rowA, rowB, colId) => {
          const a = rowA.properties[colId]?.value as string;
          const b = rowB.properties[colId]?.value as string;
          return b.localeCompare(a);
        },
      },
      {
        id: "natural",
        name: "Alphabetical",
        function: (rowA, rowB, colId) => {
          const a = rowA.properties[colId]?.value as string;
          const b = rowB.properties[colId]?.value as string;
          return a.localeCompare(b);
        },
      },
    ],
  },
  grouping: {
    defaultMethod: "first-letter",
    methods: [
      {
        id: "first-letter",
        name: "First letter",
        function: (data) => data.charAt(0),
      },
    ],
  },
  counting: [
    {
      group: "Custom",
      functions: [
        {
          id: "filled-with-a",
          name: "Filled with A",
          function: ({ rows, colId }) =>
            rows
              .filter((row) =>
                (row.original.properties[colId]?.value as string).includes("a"),
              )
              .length.toString(),
        },
      ],
    },
  ],
  compare: () => 0,
  renderCellValue: () => null,
};

const properties: ColumnInfo[] = [
  {
    id: "col1",
    name: "Name",
    type: "reverse-text",
    width: "200",
    config: undefined,
  },
];

const data: Row[] = [
  {
    id: "row1",
    createdAt: 0,
    lastEditedAt: 0,
    properties: { col1: { id: "cell1", value: "Alpha" } },
  },
  {
    id: "row2",
    createdAt: 0,
    lastEditedAt: 0,
    properties: { col1: { id: "cell2", value: "Beta" } },
  },
  {
    id: "row3",
    createdAt: 0,
    lastEditedAt: 0,
    properties: { col1: { id: "cell3", value: "Bravo" } },
  },
];

function renderCustomPluginTable() {
  const plugins = arrayToEntity([reverseTextPlugin]);
  const { result } = renderHook(() =>
    useTableView({ data, properties, plugins }),
  );
  return result.current.table;
}

describe("cell plugin registered methods", () => {
  it("contextually types sorting and grouping callbacks with plugin data and config", () => {
    interface TypedData {
      score: number;
    }
    interface TypedConfig {
      multiplier: number;
    }

    const plugin: CellPlugin<"typed", TypedData, TypedConfig> = {
      id: "typed",
      meta: { name: "Typed", desc: "Typed", icon: null },
      default: {
        name: "Typed",
        icon: null,
        data: { score: 0 },
        config: { multiplier: 1 },
      },
      fromValue: (value) => ({ score: Number(value) }),
      toValue: (value) => value.score,
      toTextValue: (value) => value.score.toString(),
      sorting: {
        methods: [
          {
            id: "score",
            name: "Score",
            ascendingLabel: "Ascending",
            descendingLabel: "Descending",
            toComparable: (value, _row, context) => {
              expectTypeOf(value).toEqualTypeOf<TypedData>();
              expectTypeOf(context.config).toEqualTypeOf<TypedConfig>();
              return value.score * context.config.multiplier;
            },
            compare: compareNumbers,
          },
        ],
      },
      grouping: {
        methods: [
          {
            id: "score",
            name: "Score",
            function: (value, _row, _colId, context) => {
              expectTypeOf(value).toEqualTypeOf<TypedData>();
              expectTypeOf(context.config).toEqualTypeOf<TypedConfig>();
              return value.score * context.config.multiplier;
            },
          },
        ],
      },
      renderCellValue: () => null,
    };

    expect(plugin.sorting?.methods[0]?.id).toBe("score");
    expect(plugin.grouping?.methods[0]?.id).toBe("score");
  });

  it("resolves the selected sorting method before the plugin default", () => {
    expect(resolveSortingMethod(reverseTextPlugin, "natural")?.id).toBe(
      "natural",
    );
  });

  it("falls back from an unknown selected sorting method to the default then first registration", () => {
    expect(resolveSortingMethod(reverseTextPlugin, "missing")?.id).toBe(
      "reverse-alpha",
    );

    const pluginWithoutRegisteredDefault: CellPlugin = {
      ...reverseTextPlugin,
      sorting: {
        defaultMethod: "missing",
        methods: reverseTextPlugin.sorting?.methods ?? [],
      },
    };

    expect(
      resolveSortingMethod(pluginWithoutRegisteredDefault, "missing")?.id,
    ).toBe("reverse-alpha");
  });

  it("resolves the selected grouping method before the plugin default", () => {
    const plugin: CellPlugin = {
      ...reverseTextPlugin,
      grouping: {
        defaultMethod: "first-letter",
        methods: [
          ...(reverseTextPlugin.grouping?.methods ?? []),
          {
            id: "all",
            name: "All",
            function: () => "All",
          },
        ],
      },
    };

    expect(resolveGroupingMethod(plugin, "all").id).toBe("all");
  });

  it("falls back from an unknown selected grouping method to the default then first registration", () => {
    expect(resolveGroupingMethod(reverseTextPlugin, "missing").id).toBe(
      "first-letter",
    );

    const pluginWithoutRegisteredDefault: CellPlugin = {
      ...reverseTextPlugin,
      grouping: {
        defaultMethod: "missing",
        methods: reverseTextPlugin.grouping?.methods ?? [],
      },
    };

    expect(
      resolveGroupingMethod(pluginWithoutRegisteredDefault, "missing").id,
    ).toBe("first-letter");
  });

  it("keeps legacy row sorting and grouping conversions executable", () => {
    const plugin: CellPlugin = {
      ...reverseTextPlugin,
      sorting: undefined,
      grouping: undefined,
      compare: () => 7,
      toGroupValue: () => "legacy group",
    };
    const row = data[0]!;

    expect(resolveSortingMethod(plugin)?.function(row, row, "col1")).toBe(7);
    expect(
      resolveGroupingMethod(plugin).function("unused", row, "col1", {
        table: {} as never,
        colId: "col1",
        config: undefined,
        weekStartsOn: 1,
      }),
    ).toBe("legacy group");
  });

  it("uses registered value comparators for ascending and descending rows while normalizing missing cells", () => {
    const contexts: number[] = [];
    const values: unknown[] = [];
    const plugin = {
      ...reverseTextPlugin,
      sorting: {
        defaultMethod: "numeric",
        methods: [
          {
            id: "numeric",
            name: "Numeric",
            ascendingLabel: "Ascending",
            descendingLabel: "Descending",
            toComparable: (
              value: unknown,
              _row: Row,
              context: { weekStartsOn: number },
            ) => {
              contexts.push(context.weekStartsOn);
              values.push(value);
              return typeof value === "number" ? value : null;
            },
            compare: (a: number, b: number) => a - b,
          },
        ],
      },
    } as CellPlugin;
    const method = resolveSortingMethod(plugin);
    const rowWithMissingCell = { ...data[0], properties: {} } as Row;
    const rowWithTwo = {
      ...data[0],
      properties: { col1: { id: "cell-2", value: 2 } },
    } as Row;
    const rowWithTen = {
      ...data[0],
      properties: { col1: { id: "cell-10", value: 10 } },
    } as Row;

    expect(method?.function).toEqual(expect.any(Function));
    expect(
      method?.function(rowWithMissingCell, rowWithTwo, "col1"),
    ).toBeLessThan(0);
    expect(method?.function(rowWithTwo, rowWithTen, "col1")).toBeLessThan(0);
    expect(method?.function(rowWithTen, rowWithTwo, "col1")).toBeGreaterThan(0);
    expect(contexts).toEqual([1, 1, 1, 1, 1, 1]);
    expect(values[0]).toBeNull();
  });

  it("marks only value-comparator sorting methods as automatically group-sortable", () => {
    const legacyMethod = resolveSortingMethod(reverseTextPlugin);
    expect(legacyMethod && isValueSortingMethod(legacyMethod)).toBe(false);
    expect(getGroupSortableSortingMethods(reverseTextPlugin)).toEqual([]);
    expect(
      getGroupSortableSortingMethods({
        ...reverseTextPlugin,
        sorting: undefined,
      }),
    ).toEqual([]);
  });

  it("falls back to an eligible value comparator for group sorting", () => {
    const valueMethod = createSortingMethod("value", "Value", compareStrings);
    const plugin: CellPlugin = {
      ...reverseTextPlugin,
      sorting: {
        defaultMethod: "value",
        methods: [
          {
            id: "legacy",
            name: "Legacy",
            function: () => 0,
          },
          valueMethod,
        ],
      },
    };

    expect(resolveGroupSortingMethod(plugin, "legacy")?.id).toBe("value");
  });

  it("keeps an incomplete registered sorting descriptor inert", () => {
    const plugin: CellPlugin = {
      ...reverseTextPlugin,
      sorting: {
        methods: [
          {
            id: "metadata-only",
            name: "Metadata only",
            ascendingLabel: "First",
            descendingLabel: "Last",
          },
        ],
      },
    };

    expect(
      resolveSortingMethod(plugin)?.function(data[0]!, data[1]!, "col1"),
    ).toBe(0);
  });

  it.each([0, 1, 2, 3, 4, 5, 6] as const)(
    "passes weekStartsOn %i to registered comparators",
    (weekStartsOn) => {
      let receivedWeekStartsOn: number | undefined;
      const plugin = {
        ...reverseTextPlugin,
        sorting: {
          defaultMethod: "context",
          methods: [
            {
              id: "context",
              name: "Context",
              ascendingLabel: "Ascending",
              descendingLabel: "Descending",
              toComparable: (
                value: unknown,
                _row: Row,
                context: { weekStartsOn: number },
              ) => {
                receivedWeekStartsOn = context.weekStartsOn;
                return value === "value" ? 1 : 0;
              },
              compare: (a: number, b: number) => a - b,
            },
          ],
        },
      } as CellPlugin;
      const row = {
        ...data[0],
        properties: { col1: { id: "cell", value: "value" } },
      } as Row;

      resolveSortingMethod(plugin, undefined, {
        config: undefined,
        weekStartsOn,
      })?.function(row, row, "col1");

      expect(receivedWeekStartsOn).toBe(weekStartsOn);
    },
  );

  it("uses plugin default sorting, grouping, and counting methods", () => {
    const table = renderCustomPluginTable();

    act(() => {
      table.setSorting([{ id: "col1", desc: false }]);
    });

    const sortedRows = table.getSortedRowModel().rows;
    expect(
      sortedRows.map((row) => {
        const value: unknown = row.original.properties.col1?.value;
        return value;
      }),
    ).toEqual(["Bravo", "Beta", "Alpha"]);

    act(() => {
      table.setGrouping(["col1"]);
    });

    const groupedRows = table.getGroupedRowModel().rows;
    expect(groupedRows.map((row) => row.groupingValue)).toEqual(["A", "B"]);

    act(() => {
      table.setColumnCountMethod("col1", "filled-with-a");
    });

    expect(table.getColumnCountResult("col1")).toBe("3");
  });

  it("recomputes sorted rows after a controlled method change is accepted", () => {
    const plugins = arrayToEntity([reverseTextPlugin]);
    const onViewChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ view }: { view: PartialTableViewState }) =>
        useTableView({
          defaultData: data,
          defaultProperties: properties,
          onViewChange,
          plugins,
          view,
        }),
      { initialProps: { view: {} } },
    );

    act(() => {
      result.current.table.setSorting([{ id: "col1", desc: false }]);
    });
    expect(
      result.current.table.getSortedRowModel().rows.map(({ id }) => id),
    ).toEqual(["row3", "row2", "row1"]);

    act(() => {
      result.current.table.setColumnSortingMethod("col1", "natural");
    });
    const proposal = onViewChange.mock.lastCall?.[0] as
      | { next: PartialTableViewState }
      | undefined;
    expect(proposal).toBeDefined();

    rerender({ view: proposal!.next });
    expect(
      result.current.table.getSortedRowModel().rows.map(({ id }) => id),
    ).toEqual(["row1", "row2", "row3"]);
  });

  it("provides the live table instance to sorting methods", () => {
    const receivedTables: unknown[] = [];
    const plugin: CellPlugin = {
      ...reverseTextPlugin,
      sorting: {
        methods: [
          {
            id: "context",
            name: "Context",
            ascendingLabel: "Ascending",
            descendingLabel: "Descending",
            toComparable: (value, _row, context) => {
              receivedTables.push(context.table);
              return String(value);
            },
            compare: compareStrings,
          },
        ],
      },
    };
    const { result } = renderHook(() =>
      useTableView({
        defaultData: data,
        defaultProperties: properties,
        plugins: arrayToEntity([plugin]),
      }),
    );

    act(() => {
      result.current.table.setSorting([{ id: "col1", desc: false }]);
    });
    result.current.table.getSortedRowModel();

    expect(receivedTables.length).toBeGreaterThan(0);
    expect(
      receivedTables.every((table) => table === result.current.table),
    ).toBe(true);
  });

  it("executes a selected named TanStack sort function through ColumnDef.sortFn", () => {
    const plugin: CellPlugin = {
      ...reverseTextPlugin,
      sorting: {
        defaultMethod: "native-text",
        methods: [
          {
            id: "native-text",
            name: "Native text",
            ascendingLabel: "Ascending",
            descendingLabel: "Descending",
            sortFn: "text",
          },
        ],
      },
    };
    const plugins = arrayToEntity([plugin]);
    const { result } = renderHook(() =>
      useTableView({ data, properties, plugins }),
    );

    act(() => {
      result.current.table.setSorting([{ id: "col1", desc: false }]);
    });

    expect(
      result.current.table.getSortedRowModel().rows.map((row) => {
        const value: unknown = row.original.properties.col1?.value;
        return value;
      }),
    ).toEqual(["Alpha", "Beta", "Bravo"]);
    expect(result.current.table.getColumn("col1")?.columnDef.sortFn).toBe(
      "text",
    );
  });

  it("keeps colliding runtime inline functions local without mutating built-in registries", () => {
    const inlineSort = (
      rowA: _RowInstance,
      rowB: _RowInstance,
      colId: string,
    ) =>
      rowB.getValue<string>(colId).localeCompare(rowA.getValue<string>(colId));
    const plugin: CellPlugin = {
      ...reverseTextPlugin,
      sorting: {
        defaultMethod: "text",
        methods: [
          {
            id: "text",
            name: "Inline",
            ascendingLabel: "Ascending",
            descendingLabel: "Descending",
            sortFn: inlineSort,
          },
        ],
      },
    };
    const plugins = arrayToEntity([plugin]);
    const { result } = renderHook(() =>
      useTableView({ data, properties, plugins }),
    );

    act(() => {
      result.current.table.setSorting([{ id: "col1", desc: false }]);
    });

    expect(
      result.current.table.getSortedRowModel().rows.map((row) => {
        const value: unknown = row.original.properties.col1?.value;
        return value;
      }),
    ).toEqual(["Bravo", "Beta", "Alpha"]);
    expect(result.current.table.getColumn("col1")?.columnDef.sortFn).toBe(
      inlineSort,
    );
    expect(DEFAULT_FEATURES.sortFns).toEqual({
      checkbox: sortBooleans,
      number: sortNumbers,
      text: sortStrings,
    });
  });
});

describe("built-in plugin helpers", () => {
  it("formats boolean and empty grouping labels", () => {
    expect(getDefaultGroupingValue(false)).toBe("False");
    expect(getDefaultGroupingValue(null)).toBe("(Empty)");
  });

  it("sorts rows with missing cells without passing undefined to comparators", () => {
    const compare =
      createCompareFn<CellPlugin<"number", number, undefined>>(compareNumbers);
    const rowWithMissingCell = { properties: {} } as Row;
    const rowWithNumber = {
      id: "row1",
      createdAt: 0,
      lastEditedAt: 0,
      properties: { col1: { id: "cell1", value: 1 } },
    } as Row;

    expect(compare(rowWithMissingCell, rowWithNumber, "col1")).toBeLessThan(0);
    expect(compare(rowWithMissingCell, rowWithMissingCell, "col1")).toBe(0);
  });
});
