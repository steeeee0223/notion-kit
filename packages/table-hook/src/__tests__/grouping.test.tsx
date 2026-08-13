/**
 * Extended Grouping Tests
 * Tests for grouping states, visibility controls, and aggregate display
 */

import type { DragEndEvent } from "@dnd-kit/react";
import { act, render, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CellPlugin } from "@notion-kit/table-hook/plugins";

import { renderTableHook } from "@/__tests__/mock";
import type { TableViewState } from "@/features/menu";
import { createGroupId } from "@/features/utils";
import type { ColumnInfo, Row } from "@/lib/types";
import { arrayToEntity } from "@/lib/utils";
import { compareNumbers } from "@/methods";
import { useTableView } from "@/table-contexts/use-table-view";

const mockProperties: ColumnInfo[] = [
  { id: "col1", name: "Name", type: "text", width: "200", config: undefined },
  {
    id: "col2",
    name: "Status",
    type: "select",
    width: "150",
    config: undefined,
  },
];

const mockData: Row[] = [
  {
    id: "row1",
    createdAt: Date.now(),
    lastEditedAt: Date.now(),
    properties: {
      col1: { id: "cell1", value: "Task 1" },
      col2: { id: "cell2", value: { name: "TODO" } },
    },
  },
  {
    id: "row2",
    createdAt: Date.now(),
    lastEditedAt: Date.now(),
    properties: {
      col1: { id: "cell3", value: "Task 2" },
      col2: { id: "cell4", value: { name: "TODO" } },
    },
  },
  {
    id: "row3",
    createdAt: Date.now(),
    lastEditedAt: Date.now(),
    properties: {
      col1: { id: "cell5", value: "Task 3" },
      col2: { id: "cell6", value: { name: "DONE" } },
    },
  },
];

const groupingMethodPlugin: CellPlugin<"grouping-method", string, undefined> = {
  id: "grouping-method",
  meta: { name: "Grouping method", desc: "Grouping method", icon: null },
  default: {
    name: "Grouping method",
    icon: null,
    config: undefined,
    data: "",
  },
  fromValue: (value) => value?.toString() ?? "",
  toValue: (value) => value,
  toTextValue: (value) => value,
  sorting: {
    defaultMethod: "numeric",
    methods: [
      {
        id: "numeric",
        name: "Numeric",
        ascendingLabel: "Ascending",
        descendingLabel: "Descending",
        toComparable: (value) => Number(value),
        compare: compareNumbers,
      },
    ],
  },
  grouping: {
    defaultMethod: "first-letter",
    methods: [
      {
        id: "first-letter",
        name: "First letter",
        function: (value) => value.slice(0, 1),
        toSortValue: (value) => (value === "b" ? 1 : 2),
      },
      {
        id: "preserve-a",
        name: "Preserve A",
        function: (value) => (value.startsWith("a") ? "a" : "other"),
        toSortValue: (value) => (value === "other" ? 1 : 2),
      },
    ],
  },
  renderCell: () => null,
};

const groupingMethodProperties: ColumnInfo[] = [
  {
    id: "method",
    name: "Method",
    type: "grouping-method",
    width: "200",
    config: undefined,
  },
];

const groupingMethodData: Row[] = [
  {
    id: "method-row-1",
    createdAt: 0,
    lastEditedAt: 0,
    properties: { method: { id: "method-cell-1", value: "alpha" } },
  },
  {
    id: "method-row-2",
    createdAt: 0,
    lastEditedAt: 0,
    properties: { method: { id: "method-cell-2", value: "beta" } },
  },
  {
    id: "method-row-3",
    createdAt: 0,
    lastEditedAt: 0,
    properties: { method: { id: "method-cell-3", value: "bravo" } },
  },
];

const weekContextPlugin: CellPlugin<"week-context", number, undefined> = {
  id: "week-context",
  meta: { name: "Week context", desc: "Week context", icon: null },
  default: {
    name: "Week context",
    icon: null,
    config: undefined,
    data: 0,
  },
  fromValue: (value) => Number(value),
  toValue: (value) => value,
  toTextValue: (value) => value.toString(),
  sorting: {
    defaultMethod: "numeric",
    methods: [
      {
        id: "numeric",
        name: "Numeric",
        ascendingLabel: "Ascending",
        descendingLabel: "Descending",
        toComparable: (value) => value,
        compare: compareNumbers,
      },
    ],
  },
  grouping: {
    defaultMethod: "week",
    methods: [
      {
        id: "week",
        name: "Week",
        function: (day, _row, _colId, context) =>
          day - ((day - context.weekStartsOn + 7) % 7),
        toSortValue: (weekStart, context) =>
          Number(weekStart) + context.weekStartsOn / 10,
      },
    ],
  },
  renderCell: () => null,
};

const weekContextProperties: ColumnInfo[] = [
  {
    id: "week",
    name: "Week",
    type: "week-context",
    width: "200",
    config: undefined,
  },
];

const weekContextData: Row[] = [
  {
    id: "day-7",
    createdAt: 0,
    lastEditedAt: 0,
    properties: { week: { id: "day-7-cell", value: 7 } },
  },
  {
    id: "day-0",
    createdAt: 0,
    lastEditedAt: 0,
    properties: { week: { id: "day-0-cell", value: 0 } },
  },
  {
    id: "day-1",
    createdAt: 0,
    lastEditedAt: 0,
    properties: { week: { id: "day-1-cell", value: 1 } },
  },
];

function renderGroupingMethodTable(onViewChange?: () => void) {
  const plugins = arrayToEntity([groupingMethodPlugin]);
  const { result } = renderHook(() =>
    useTableView({
      defaultData: groupingMethodData,
      defaultProperties: groupingMethodProperties,
      onViewChange,
      plugins,
    }),
  );
  return result.current.table;
}

describe("useTableView - Extended Grouping", () => {
  describe("Plugin grouping methods", () => {
    it("stores derived grouping sort values without functions", () => {
      const table = renderGroupingMethodTable();

      act(() => {
        table.setGrouping(["method"]);
      });

      const groupValues = table.atoms.groupingState.get().groupValues;
      expect(
        Object.values(groupValues).map(({ value, sortValue }) => ({
          value,
          sortValue,
        })),
      ).toEqual([
        { value: "a", sortValue: 2 },
        { value: "b", sortValue: 1 },
      ]);
      expect(
        Object.values(groupValues).flatMap((entry) => Object.values(entry)),
      ).not.toContainEqual(expect.any(Function));
    });

    it("uses Sunday and Monday runtime context for group IDs, sort values, and automatic order", () => {
      const initialProps = { weekStartsOn: 0 as 0 | 1 };
      const { result, rerender } = renderHook(
        ({ weekStartsOn }: { weekStartsOn: 0 | 1 }) =>
          useTableView({
            defaultData: weekContextData,
            defaultProperties: weekContextProperties,
            plugins: arrayToEntity([weekContextPlugin]),
            weekStartsOn,
          }),
        { initialProps },
      );

      act(() => {
        result.current.table.setGrouping(["week"]);
        result.current.table.setGroupSort({
          mode: "ascending",
          method: "numeric",
        });
      });

      expect(result.current.table.atoms.groupingState.get()).toMatchObject({
        groupOrder: [createGroupId("week", 0), createGroupId("week", 7)],
        groupValues: {
          [createGroupId("week", 0)]: { value: 0, sortValue: 0 },
          [createGroupId("week", 7)]: { value: 7, sortValue: 7 },
        },
      });

      rerender({ weekStartsOn: 1 });

      expect(result.current.table.atoms.groupingState.get()).toMatchObject({
        groupOrder: [createGroupId("week", -6), createGroupId("week", 1)],
        groupValues: {
          [createGroupId("week", -6)]: { value: -6, sortValue: -5.9 },
          [createGroupId("week", 1)]: { value: 1, sortValue: 1.1 },
        },
      });
    });

    it("preserves data order when automatic group sorting is disabled", () => {
      const plugin: typeof groupingMethodPlugin = {
        ...groupingMethodPlugin,
        sorting: {
          ...groupingMethodPlugin.sorting!,
          enableGroupSort: false,
        },
      };
      const { result } = renderHook(() =>
        useTableView({
          defaultData: groupingMethodData,
          defaultProperties: groupingMethodProperties,
          plugins: arrayToEntity([plugin]),
          defaultView: {
            pluginMethods: {
              groupSort: {
                mode: "ascending",
                method: "numeric",
              },
            },
          },
        }),
      );

      act(() => {
        result.current.table.setGrouping(["method"]);
      });

      expect(result.current.table.atoms.groupingState.get().groupOrder).toEqual(
        [createGroupId("method", "a"), createGroupId("method", "b")],
      );
    });

    it("resets automatic group sorting when the grouping column does not support it", () => {
      const manualOnlyPlugin: CellPlugin<
        "manual-grouping-method",
        string,
        undefined
      > = {
        ...groupingMethodPlugin,
        id: "manual-grouping-method",
        sorting: {
          ...groupingMethodPlugin.sorting!,
          enableGroupSort: false,
        },
      };
      const properties: ColumnInfo[] = [
        ...groupingMethodProperties,
        {
          id: "manual-method",
          name: "Manual method",
          type: "manual-grouping-method",
          width: "200",
          config: undefined,
        },
      ];
      const data = groupingMethodData.map((row) => ({
        ...row,
        properties: {
          ...row.properties,
          "manual-method": {
            id: `${row.id}-manual-method`,
            value: String(row.properties.method?.value ?? ""),
          },
        },
      }));
      const { result } = renderHook(() =>
        useTableView({
          defaultData: data,
          defaultProperties: properties,
          plugins: arrayToEntity([groupingMethodPlugin, manualOnlyPlugin]),
        }),
      );

      act(() => {
        result.current.table.setGroupingColumn("method");
        result.current.table.setGroupSort({
          mode: "ascending",
          method: "numeric",
        });
      });
      act(() => {
        result.current.table.setGroupingColumn("manual-method");
      });

      expect(result.current.table.getGroupSort()).toEqual({ mode: "manual" });
    });

    it("retains manual mode and a compatible automatic method across grouping selection", () => {
      const table = renderGroupingMethodTable();

      act(() => table.setGroupingColumn("method"));
      expect(table.getGroupSort()).toEqual({ mode: "manual" });

      act(() =>
        table.setGroupSort({
          mode: "ascending",
          method: "numeric",
        }),
      );
      act(() => table.setGroupingColumn("method"));
      expect(table.getGroupSort()).toEqual({
        mode: "ascending",
        method: "numeric",
      });

      act(() => table.setGroupingColumn(null));
      expect(table.getGroupSort()).toEqual({ mode: "manual" });
    });

    it("selects the new default when the automatic group sorting method is incompatible", () => {
      const lexicalPlugin: CellPlugin<
        "lexical-grouping-method",
        string,
        undefined
      > = {
        ...groupingMethodPlugin,
        id: "lexical-grouping-method",
        sorting: {
          defaultMethod: "lexical",
          methods: [
            {
              ...groupingMethodPlugin.sorting!.methods[0]!,
              id: "lexical",
              name: "Lexical",
            },
          ],
        },
      };
      const properties: ColumnInfo[] = [
        ...groupingMethodProperties,
        {
          id: "lexical-method",
          name: "Lexical method",
          type: "lexical-grouping-method",
          width: "200",
          config: undefined,
        },
      ];
      const data = groupingMethodData.map((row) => ({
        ...row,
        properties: {
          ...row.properties,
          "lexical-method": {
            id: `${row.id}-lexical-method`,
            value: String(row.properties.method?.value ?? ""),
          },
        },
      }));
      const { result } = renderHook(() =>
        useTableView({
          defaultData: data,
          defaultProperties: properties,
          plugins: arrayToEntity([groupingMethodPlugin, lexicalPlugin]),
        }),
      );

      act(() => {
        result.current.table.setGroupingColumn("method");
        result.current.table.setGroupSort({
          mode: "descending",
          method: "numeric",
        });
      });
      act(() => {
        result.current.table.setGroupingColumn("lexical-method");
      });

      expect(result.current.table.getGroupSort()).toEqual({
        mode: "descending",
        method: "lexical",
      });
    });

    it("rebuilds groups and prunes only stale visibility after changing methods", async () => {
      const table = renderGroupingMethodTable();

      act(() => {
        table.setGrouping(["method"]);
      });

      const firstGroupIds = table.atoms.groupingState.get().groupOrder;
      const survivingGroupId = firstGroupIds[0]!;
      const staleGroupId = firstGroupIds[1]!;

      await act(async () => {
        table.toggleGroupVisible(survivingGroupId);
        table.setColumnGroupingMethod("method", "preserve-a");
        await Promise.resolve();
      });

      const groupingState = table.atoms.groupingState.get();
      expect(groupingState.groupOrder).toContain(survivingGroupId);
      expect(groupingState.groupOrder).not.toContain(staleGroupId);
      expect(groupingState.groupVisibility).toEqual({
        [survivingGroupId]: false,
      });
      expect(
        Object.values(groupingState.groupValues).map(({ value }) => value),
      ).toEqual(["a", "other"]);
    });

    it("GroupedRowModel_GroupingMethodChanges_RecomputesRowsWithCurrentMethod", async () => {
      const table = renderGroupingMethodTable();

      act(() => table.setGrouping(["method"]));
      expect(
        table.getGroupedRowModel().rows.map((row) => row.groupingValue),
      ).toEqual(["a", "b"]);

      await act(async () => {
        table.setColumnGroupingMethod("method", "preserve-a");
        await Promise.resolve();
      });

      const groupingState = table.atoms.groupingState.get();
      expect(groupingState.groupOrder).toEqual([
        createGroupId("method", "a"),
        createGroupId("method", "other"),
      ]);
      expect(
        table.getGroupedRowModel().rows.map((row) => ({
          id: row.id,
          value: row.groupingValue,
        })),
      ).toEqual([
        { id: createGroupId("method", "a"), value: "a" },
        { id: createGroupId("method", "other"), value: "other" },
      ]);
    });

    it("falls back from an unknown grouping method without stale group IDs", () => {
      const table = renderGroupingMethodTable();

      act(() => {
        table.setGrouping(["method"]);
        table.setColumnGroupingMethod("method", "unknown");
      });

      const groupingState = table.atoms.groupingState.get();
      expect(groupingState.groupOrder).toEqual(
        table.getGroupedRowModel().rows.map((row) => row.id),
      );
      expect(
        Object.values(groupingState.groupValues).map(
          ({ value, sortValue }) => ({
            value,
            sortValue,
          }),
        ),
      ).toEqual([
        { value: "a", sortValue: 2 },
        { value: "b", sortValue: 1 },
      ]);
    });

    it("waits for a controlled grouping method selection before rebuilding groups", async () => {
      const plugins = arrayToEntity([groupingMethodPlugin]);
      const { result } = renderHook(() =>
        useTableView({
          defaultData: groupingMethodData,
          defaultProperties: groupingMethodProperties,
          plugins,
          view: {
            layout: "table",
            rowView: "side",
            openedRowId: null,
            pluginMethods: {
              groupingMethodByColumn: { method: "first-letter" },
            },
          },
        }),
      );
      const table = result.current.table;

      act(() => {
        table.setGrouping(["method"]);
      });
      const previous = table.atoms.groupingState.get();

      await act(async () => {
        table.setColumnGroupingMethod("method", "preserve-a");
        await Promise.resolve();
      });

      expect(table.atoms.groupingState.get()).toEqual(previous);
    });

    it("does not reorder groups when a controlled drag's manual mode is rejected", async () => {
      const plugins = arrayToEntity([groupingMethodPlugin]);
      const { result } = renderHook(() =>
        useTableView({
          defaultData: groupingMethodData,
          defaultProperties: groupingMethodProperties,
          plugins,
          view: {
            layout: "table",
            rowView: "side",
            openedRowId: null,
            pluginMethods: {
              groupSort: {
                mode: "ascending",
                method: "numeric",
              },
            },
          },
        }),
      );
      const table = result.current.table;

      act(() => {
        table.setGrouping(["method"]);
      });
      const [bGroupId, aGroupId] = table.atoms.groupingState.get().groupOrder;
      act(() => {
        table.toggleGroupVisible(aGroupId!);
      });
      const previous = table.atoms.groupingState.get();

      await act(async () => {
        table.handleGroupedRowDragEnd({
          canceled: false,
          operation: {
            canceled: false,
            source: { id: bGroupId },
            target: { id: aGroupId },
          },
        } as DragEndEvent);
        await Promise.resolve();
      });

      expect(table.getGroupSort()).toEqual({
        mode: "ascending",
        method: "numeric",
      });
      expect(table.atoms.groupingState.get()).toEqual(previous);
    });

    it("discards a rejected drag before an unrelated controlled manual mode change", async () => {
      const plugins = arrayToEntity([groupingMethodPlugin]);
      const automaticView = {
        layout: "table",
        rowView: "side",
        openedRowId: null,
        pluginMethods: {
          groupSort: { mode: "ascending", method: "numeric" },
        },
      } as const satisfies Partial<TableViewState>;
      const manualView = {
        ...automaticView,
        pluginMethods: { groupSort: { mode: "manual" } },
      } as const satisfies Partial<TableViewState>;
      const initialProps: { view: Partial<TableViewState> } = {
        view: automaticView,
      };
      const { result, rerender } = renderHook(
        ({ view }: { view: Partial<TableViewState> }) =>
          useTableView({
            defaultData: groupingMethodData,
            defaultProperties: groupingMethodProperties,
            plugins,
            view,
          }),
        { initialProps },
      );
      const table = result.current.table;

      act(() => {
        table.setGrouping(["method"]);
      });
      const [bGroupId, aGroupId] = table.atoms.groupingState.get().groupOrder;
      act(() => {
        table.toggleGroupVisible(aGroupId!);
      });
      const previous = table.atoms.groupingState.get();

      act(() => {
        table.handleGroupedRowDragEnd({
          canceled: false,
          operation: {
            canceled: false,
            source: { id: bGroupId },
            target: { id: aGroupId },
          },
        } as DragEndEvent);
        rerender({ view: automaticView });
      });

      await act(async () => {
        rerender({ view: manualView });
        await Promise.resolve();
      });

      expect(result.current.table.getGroupSort()).toEqual({ mode: "manual" });
      expect(result.current.table.atoms.groupingState.get()).toEqual(previous);
    });

    it("applies a controlled drag when manual mode is accepted after later microtasks", async () => {
      const onViewChange = vi.fn();
      const plugins = arrayToEntity([groupingMethodPlugin]);
      const automaticView = {
        layout: "table",
        rowView: "side",
        openedRowId: null,
        pluginMethods: {
          groupSort: { mode: "ascending", method: "numeric" },
        },
      } as const satisfies Partial<TableViewState>;
      const initialProps: { view: Partial<TableViewState> } = {
        view: automaticView,
      };
      const { result, rerender } = renderHook(
        ({ view }: { view: Partial<TableViewState> }) =>
          useTableView({
            defaultData: groupingMethodData,
            defaultProperties: groupingMethodProperties,
            onViewChange,
            plugins,
            view,
          }),
        { initialProps },
      );

      act(() => {
        result.current.table.setGrouping(["method"]);
      });
      const [bGroupId, aGroupId] =
        result.current.table.atoms.groupingState.get().groupOrder;
      act(() => {
        result.current.table.toggleGroupVisible(aGroupId!);
        result.current.table.handleGroupedRowDragEnd({
          canceled: false,
          operation: {
            canceled: false,
            source: { id: bGroupId },
            target: { id: aGroupId },
          },
        } as DragEndEvent);
      });

      await Promise.resolve();
      await Promise.resolve();
      const manualProposal = onViewChange.mock.lastCall?.[0] as {
        next: Partial<TableViewState>;
      };
      rerender({ view: manualProposal.next });

      expect(result.current.table.getGroupSort()).toEqual({ mode: "manual" });
      expect(result.current.table.atoms.groupingState.get()).toMatchObject({
        groupOrder: [aGroupId, bGroupId],
        groupVisibility: { [aGroupId!]: false },
      });
      expect(onViewChange).toHaveBeenCalledOnce();
    });

    it("orders groups automatically with the selected comparator and preserves visibility", async () => {
      const table = renderGroupingMethodTable();

      act(() => {
        table.setGrouping(["method"]);
      });

      const [aGroupId, bGroupId] = table.atoms.groupingState.get().groupOrder;
      await act(async () => {
        table.toggleGroupVisible(aGroupId!);
        table.setGroupSort({
          mode: "ascending",
          method: "numeric",
        });
        await Promise.resolve();
      });

      expect(table.atoms.groupingState.get().groupOrder).toEqual([
        bGroupId,
        aGroupId,
      ]);
      expect(table.atoms.groupingState.get().groupVisibility).toEqual({
        [aGroupId!]: false,
      });

      await act(async () => {
        table.setGroupSort({
          mode: "descending",
          method: "numeric",
        });
        await Promise.resolve();
      });

      expect(table.atoms.groupingState.get().groupOrder).toEqual([
        aGroupId,
        bGroupId,
      ]);
      expect(table.atoms.groupingState.get().groupVisibility).toEqual({
        [aGroupId!]: false,
      });
    });

    it("does not reorder groups when a controlled automatic proposal is rejected", () => {
      const onViewChange = vi.fn();
      const { result } = renderHook(() =>
        useTableView({
          defaultData: groupingMethodData,
          defaultProperties: groupingMethodProperties,
          plugins: arrayToEntity([groupingMethodPlugin]),
          view: {
            pluginMethods: { groupSort: { mode: "manual" } },
          },
          onViewChange,
        }),
      );
      const table = result.current.table;
      act(() => table.setGrouping(["method"]));
      const previousOrder = table.atoms.groupingState.get().groupOrder;

      act(() =>
        table.setGroupSort({
          mode: "ascending",
          method: "numeric",
        }),
      );

      expect(onViewChange).toHaveBeenCalledOnce();
      expect(table.getGroupSort()).toEqual({ mode: "manual" });
      expect(table.atoms.groupingState.get().groupOrder).toEqual(previousOrder);
    });

    it("orders null and tied automatic group keys deterministically", () => {
      const plugin: typeof groupingMethodPlugin = {
        ...groupingMethodPlugin,
        grouping: {
          defaultMethod: "edge",
          methods: [
            {
              id: "edge",
              name: "Edge",
              function: (value) =>
                String(value).startsWith("empty") ? null : value,
              toSortValue: (value) =>
                value === null
                  ? null
                  : String(value).startsWith("tie")
                    ? 1
                    : Number(value),
            },
          ],
        },
      };
      const data = ["empty-b", "tie-b", "2", "empty-a", "tie-a"].map(
        (value, index): Row => ({
          id: `edge-${index}`,
          createdAt: 0,
          lastEditedAt: 0,
          properties: { method: { id: `cell-${index}`, value } },
        }),
      );
      const { result } = renderHook(() =>
        useTableView({
          defaultData: data,
          defaultProperties: groupingMethodProperties,
          plugins: arrayToEntity([plugin]),
        }),
      );
      act(() => result.current.table.setGrouping(["method"]));
      expect(
        result.current.table.atoms.groupingState.get().groupValues[
          createGroupId("method", null)
        ]?.sortValue,
      ).toBeNull();
      expect(
        result.current.table.atoms.groupingState.get().groupValues[
          createGroupId("method", "tie-b")
        ]?.sortValue,
      ).toBe(1);
      act(() => {
        result.current.table._syncGroupingState({
          groupSort: {
            mode: "ascending",
            method: "numeric",
          },
        });
      });

      expect(result.current.table.atoms.groupingState.get().groupOrder).toEqual(
        [
          createGroupId("method", "tie-a"),
          createGroupId("method", "tie-b"),
          createGroupId("method", "2"),
          createGroupId("method", null),
        ],
      );
    });

    it("keeps an automatic sync empty when there is no grouped column", () => {
      const { result } = renderHook(() =>
        useTableView({
          defaultData: groupingMethodData,
          defaultProperties: groupingMethodProperties,
          plugins: arrayToEntity([groupingMethodPlugin]),
          defaultView: {
            pluginMethods: {
              groupSort: {
                mode: "ascending",
                method: "numeric",
              },
            },
          },
        }),
      );

      act(() => result.current.table._syncGroupingStateFromData([]));
      expect(result.current.table.atoms.groupingState.get().groupOrder).toEqual(
        [],
      );
    });

    it("switches automatic group ordering to manual once after a drag", () => {
      const onViewChange = vi.fn();
      const table = renderGroupingMethodTable(onViewChange);

      act(() => {
        table.setGrouping(["method"]);
        table.setGroupSort({
          mode: "ascending",
          method: "numeric",
        });
      });

      const [bGroupId, aGroupId] = table.atoms.groupingState.get().groupOrder;
      onViewChange.mockClear();
      act(() => {
        table.handleGroupedRowDragEnd({
          canceled: false,
          operation: {
            canceled: false,
            source: { id: bGroupId },
            target: { id: aGroupId },
          },
        } as DragEndEvent);
      });

      expect(table.getGroupSort()).toEqual({ mode: "manual" });
      expect(table.atoms.groupingState.get().groupOrder).toEqual([
        aGroupId,
        bGroupId,
      ]);
      expect(onViewChange).toHaveBeenCalledTimes(1);
    });
  });

  describe("Grouping State", () => {
    it("should initialize with empty grouping state", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      const groupingState = table.atoms.groupingState.get();

      expect(groupingState.groupOrder).toEqual([]);
      expect(groupingState.groupVisibility).toEqual({});
      expect(groupingState.groupValues).toEqual({});
      expect(groupingState.showAggregates).toBe(true);
      expect(groupingState.hideEmptyGroups).toBe(true);
    });

    it("should populate groupOrder when grouping is set", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      const initialGroupOrder = table.atoms.groupingState.get().groupOrder;

      act(() => {
        table.setGrouping(["col2"]);
      });

      const groupingState = table.atoms.groupingState.get();
      expect(groupingState.groupOrder).not.toBe(initialGroupOrder);
      expect(initialGroupOrder).toEqual([]);
      expect(groupingState.groupOrder.length).toBeGreaterThan(0);
    });

    it("should populate groupValues when grouping is set", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGrouping(["col2"]);
      });

      const groupingState = table.atoms.groupingState.get();
      expect(Object.keys(groupingState.groupValues).length).toBeGreaterThan(0);
    });

    it("should store grouping values correctly", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGrouping(["col2"]);
      });

      const groupingState = table.atoms.groupingState.get();
      const groupIds = groupingState.groupOrder;

      groupIds.forEach((groupId) => {
        const groupValue = groupingState.groupValues[groupId];
        expect(groupValue).toBeDefined();
        expect(groupValue?.value).toBeDefined();
        expect(groupValue?.original).toBeDefined();
      });
    });

    it("should include each grouped flat row exactly once", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGrouping(["col2"]);
      });

      const flatRowIds = table
        .getGroupedRowModel()
        .flatRows.map((row) => row.id);
      expect(new Set(flatRowIds).size).toBe(flatRowIds.length);
    });

    it("should preserve hidden group metadata when regrouping", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGrouping(["col2"]);
      });

      const hiddenGroupId = table.atoms.groupingState.get().groupOrder[0]!;

      act(() => {
        table.toggleGroupVisible(hiddenGroupId);
        table.setGrouping(["col2"]);
      });

      expect(table.atoms.groupingState.get().groupOrder).toContain(
        hiddenGroupId,
      );
      expect(
        table.atoms.groupingState.get().groupValues[hiddenGroupId],
      ).toBeDefined();
    });
  });

  describe("Group Visibility", () => {
    it("should toggle individual group visibility", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGrouping(["col2"]);
      });

      const groupId = table.atoms.groupingState.get().groupOrder[0]!;

      act(() => {
        table.toggleGroupVisible(groupId);
      });

      const groupVisibility = table.atoms.groupingState.get().groupVisibility;
      expect(groupVisibility[groupId]).toBe(false);

      act(() => {
        table.toggleGroupVisible(groupId);
      });

      const updatedVisibility = table.atoms.groupingState.get().groupVisibility;
      expect(updatedVisibility[groupId]).toBe(true);
    });

    it("should check if some groups are visible", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGrouping(["col2"]);
      });

      // Initially all groups should be visible
      expect(table.getIsSomeGroupVisible()).toBe(true);

      // Hide all groups
      const groupIds = table.atoms.groupingState.get().groupOrder;
      act(() => {
        groupIds.forEach((groupId) => {
          table.toggleGroupVisible(groupId);
        });
      });

      expect(table.getIsSomeGroupVisible()).toBe(false);
    });

    it("should toggle all groups visible at once", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGrouping(["col2"]);
      });

      const groupIds = table.atoms.groupingState.get().groupOrder;

      // Hide all
      act(() => {
        table.toggleAllGroupsVisible();
      });

      const hiddenVisibility = table.atoms.groupingState.get().groupVisibility;
      groupIds.forEach((groupId) => {
        expect(hiddenVisibility[groupId]).toBe(false);
      });

      // Show all
      act(() => {
        table.toggleAllGroupsVisible();
      });

      const shownVisibility = table.atoms.groupingState.get().groupVisibility;
      groupIds.forEach((groupId) => {
        expect(shownVisibility[groupId]).toBe(true);
      });
    });
  });

  describe("Empty Groups", () => {
    it("should toggle hide empty groups setting", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      const initialState = table.atoms.groupingState.get().hideEmptyGroups;

      act(() => {
        table.toggleHideEmptyGroups();
      });

      const toggledState = table.atoms.groupingState.get().hideEmptyGroups;
      expect(toggledState).toBe(!initialState);
    });

    it("should default to hiding empty groups", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      expect(table.atoms.groupingState.get().hideEmptyGroups).toBe(true);
    });
  });

  describe("Aggregate Display", () => {
    it("should toggle show aggregates setting", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGrouping(["col2"]);
      });

      const row = table.getGroupedRowModel().rows[0];

      expect(row?.getIsGrouped()).toBe(true);
      const initialState = row!.getShouldShowGroupAggregates();

      act(() => {
        row!.toggleGroupAggregates();
      });

      const toggledState = row!.getShouldShowGroupAggregates();
      expect(toggledState).toBe(!initialState);
    });

    it("should default to showing aggregates", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGrouping(["col2"]);
      });

      const row = table.getGroupedRowModel().rows[0];

      expect(row?.getIsGrouped()).toBe(true);
      expect(row!.getShouldShowGroupAggregates()).toBe(true);
    });
  });

  describe("Group Column Info", () => {
    it("should get grouped column info", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGrouping(["col2"]);
      });

      const groupedColumn = table.getGroupedColumnInfo();
      expect(groupedColumn).toBeDefined();
      expect(groupedColumn?.id).toBe("col2");
    });

    it("should return null when not grouping", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      const groupedColumn = table.getGroupedColumnInfo();

      expect(groupedColumn).toBeNull();
    });
  });

  describe("Set Grouping Column", () => {
    it("should set grouping column by id", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGroupingColumn("col2");
      });

      const grouping = table.atoms.grouping.get();
      expect(grouping).toEqual(["col2"]);
    });

    it("should clear grouping when set to null", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGroupingColumn("col2");
      });

      expect(table.atoms.grouping.get()).toHaveLength(1);

      act(() => {
        table.setGroupingColumn(null);
      });

      expect(table.atoms.grouping.get()).toEqual([]);
    });

    it("should reset grouping state when changing grouping column", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGroupingColumn("col2");
      });

      const firstGroupOrder = table.atoms.groupingState.get().groupOrder;
      expect(firstGroupOrder.length).toBeGreaterThan(0);

      act(() => {
        table.setGroupingColumn(null);
      });

      const clearedGroupOrder = table.atoms.groupingState.get().groupOrder;
      expect(clearedGroupOrder).toEqual([]);
    });

    it("should rebuild grouping state when core grouping APIs are used directly", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGrouping(["col2"]);
      });

      expect(table.atoms.groupingState.get().groupOrder.length).toBeGreaterThan(
        0,
      );

      act(() => {
        table.resetGrouping();
      });

      expect(table.atoms.groupingState.get().groupOrder).toEqual([]);
      expect(table.atoms.groupingState.get().groupValues).toEqual({});

      act(() => {
        table.setGrouping(["col2"]);
      });

      expect(table.atoms.groupingState.get().groupOrder.length).toBeGreaterThan(
        0,
      );
      expect(
        Object.keys(table.atoms.groupingState.get().groupValues).length,
      ).toBeGreaterThan(0);
    });
  });

  describe("Group DnD", () => {
    it("GroupDrag_ProjectedSelfTarget_ReordersStateAndRenderedGroupRows", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGrouping(["col2"]);
      });

      const initialGroupOrder = table.atoms.groupingState.get().groupOrder;
      const firstGroupId = initialGroupOrder[0]!;
      const secondGroupId = initialGroupOrder[1]!;

      expect(table.getRowModel().rows.map((row) => row.id)).toEqual(
        initialGroupOrder,
      );

      act(() => {
        table.handleGroupedRowDragEnd({
          canceled: false,
          operation: {
            canceled: false,
            source: { id: firstGroupId, initialIndex: 0, index: 1 },
            target: { id: firstGroupId },
          },
        } as unknown as DragEndEvent);
      });

      const expectedGroupOrder = [
        secondGroupId,
        firstGroupId,
        ...initialGroupOrder.slice(2),
      ];
      expect(table.atoms.groupingState.get().groupOrder).toEqual(
        expectedGroupOrder,
      );
      expect(table.getRowModel().rows.map((row) => row.id)).toEqual(
        expectedGroupOrder,
      );
    });

    it("GroupDrag_DifferentTarget_ReordersGroupsExactly", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGrouping(["col2"]);
      });

      const initialGroupOrder = table.atoms.groupingState.get().groupOrder;

      // Ensure we have at least 2 groups to test drag
      expect(initialGroupOrder.length).toBeGreaterThanOrEqual(2);

      const firstGroupId = initialGroupOrder[0]!;
      const secondGroupId = initialGroupOrder[1]!;

      act(() => {
        table.handleGroupedRowDragEnd({
          canceled: false,
          operation: {
            canceled: false,
            source: { id: firstGroupId },
            target: { id: secondGroupId },
          },
        } as DragEndEvent);
      });

      const newGroupOrder = table.atoms.groupingState.get().groupOrder;

      expect(newGroupOrder).toEqual([
        secondGroupId,
        firstGroupId,
        ...initialGroupOrder.slice(2),
      ]);
    });

    it.each([
      ["canceled event", true, false, { id: "source" }, { id: "target" }],
      ["canceled operation", false, true, { id: "source" }, { id: "target" }],
      ["missing source", false, false, null, { id: "target" }],
      ["missing target", false, false, { id: "source" }, null],
      ["self target", false, false, { id: "source" }, { id: "source" }],
    ])(
      "GroupDrag_%s_PreservesGroupOrderWithoutStateCallback",
      (_scenario, canceled, operationCanceled, source, target) => {
        const { table } = renderTableHook({
          data: mockData,
          properties: mockProperties,
        });
        act(() => table.setGrouping(["col2"]));
        const previous = table.atoms.groupingState.get().groupOrder;
        const onGroupingStateChange = vi.fn();
        table.setOptions((options) => ({
          ...options,
          onGroupingStateChange,
        }));

        act(() => {
          table.handleGroupedRowDragEnd({
            canceled,
            operation: {
              canceled: operationCanceled,
              source,
              target,
            },
          } as unknown as DragEndEvent);
        });

        expect(onGroupingStateChange).not.toHaveBeenCalled();
        expect(table.atoms.groupingState.get().groupOrder).toEqual(previous);
      },
    );
  });

  describe("Row Group Visibility API", () => {
    it("should toggle group visibility from row", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGrouping(["col2"]);
      });

      const groupedRow = table.getGroupedRowModel().rows[0];

      expect(groupedRow?.getIsGrouped()).toBe(true);
      const groupId = groupedRow!.id;
      const initialVisibility =
        table.atoms.groupingState.get().groupVisibility[groupId] ?? true;

      act(() => {
        groupedRow!.toggleGroupVisibility();
      });

      const newVisibility =
        table.atoms.groupingState.get().groupVisibility[groupId];
      expect(newVisibility).toBe(!initialVisibility);
    });

    it("reports and toggles grouped descendant selection states", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      act(() => table.setGrouping(["col2"]));
      const groupedRow = table.getGroupedRowModel().rows[0]!;
      const leafRow = groupedRow.subRows[0]!;

      expect(groupedRow.getGroupSelectionState()).toBe("unchecked");
      expect(leafRow.getGroupSelectionState()).toBe("unchecked");
      act(() => groupedRow.toggleGroupSelection());
      expect(groupedRow.getGroupSelectionState()).toBe("checked");
      act(() => groupedRow.toggleGroupSelection());
      expect(groupedRow.getGroupSelectionState()).toBe("unchecked");

      act(() => table.setRowSelection({ [leafRow.id]: true }));
      expect(groupedRow.getGroupSelectionState()).toBe(
        groupedRow.subRows.length === 1 ? "checked" : "indeterminate",
      );
      act(() => leafRow.toggleGroupSelection());
      expect(table.getSelectedRowIds()).toContain(leafRow.id);
    });

    it("resets grouping metadata and constructs placeholder rows", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      act(() => table.setGrouping(["col2"]));
      const groupId = table.atoms.groupingState.get().groupOrder[0]!;
      const placeholder = table.getPlaceholderGroupedRow(groupId);
      expect(placeholder.id).toBe(groupId);
      expect(placeholder.original.properties).toEqual({});

      act(() => {
        table.toggleGroupVisible(groupId);
        table._resetGroupingState();
      });
      expect(table.atoms.groupingState.get()).toMatchObject({
        groupOrder: [],
        groupVisibility: {},
        groupValues: {},
      });
    });

    it("renders custom and fallback grouping values and handles a stale renderer", () => {
      const plugin: typeof groupingMethodPlugin = {
        ...groupingMethodPlugin,
        renderGroupingValue: ({ value }) => <span>Custom {String(value)}</span>,
      };
      const { result } = renderHook(() =>
        useTableView({
          defaultData: groupingMethodData,
          defaultProperties: groupingMethodProperties,
          plugins: arrayToEntity([plugin]),
        }),
      );
      const custom = result.current.table;
      act(() => custom.setGrouping(["method"]));
      const customId = custom.atoms.groupingState.get().groupOrder[0]!;
      const CustomRenderer = custom.getGroupingValueRenderer(customId);
      const customView = render(CustomRenderer({ className: "group-label" }));
      expect(customView.container).toHaveTextContent("Custom a");
      const groupedRow = custom.getGroupedRowModel().rows[0]!;
      expect(
        render(groupedRow.renderGroupingValue({})).container,
      ).toHaveTextContent("Custom a");

      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      act(() => table.setGrouping(["col2"]));
      const groupId = table.atoms.groupingState.get().groupOrder[0]!;
      const Renderer = table.getGroupingValueRenderer(groupId);
      const view = render(Renderer({}));
      expect(view.container.textContent).not.toBe("");

      const error = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      act(() => table.setGrouping([]));
      expect(render(Renderer({})).container).toBeEmptyDOMElement();
      expect(error).toHaveBeenCalledWith(
        `No grouping column id found for the grouped row ${groupId}`,
      );
      error.mockRestore();
    });
  });
});
