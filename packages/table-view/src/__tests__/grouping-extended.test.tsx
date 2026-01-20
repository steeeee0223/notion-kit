/**
 * Extended Grouping Tests
 * Tests for grouping states, visibility controls, and aggregate display
 */

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ColumnInfo, Row } from "../lib/types";
import type { Entity } from "../lib/utils";
import { useTableView } from "../table-contexts/use-table-view";

// Mock plugins with grouping support
const mockPlugins: Entity<any> = {
  ids: ["text", "select"],
  items: {
    text: {
      id: "text",
      type: "text",
      name: "Text",
      default: { config: {}, data: "" },
      compare: (_a: any, _b: any, _colId: string) => 0,
      toValue: (value: any) => String(value ?? ""),
      toGroupValue: (value: any) => String(value ?? ""),
    },
    select: {
      id: "select",
      type: "select",
      name: "Select",
      default: { config: {}, data: null },
      compare: (_a: any, _b: any, _colId: string) => 0,
      toValue: (value: any) => value,
      toGroupValue: (value: any) => value?.name ?? "",
    },
  },
};

const mockProperties: ColumnInfo[] = [
  { id: "col1", name: "Name", type: "text", width: 200 },
  { id: "col2", name: "Status", type: "select", width: 150 },
];

const mockData: Row<any>[] = [
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

describe("useTableView - Extended Grouping", () => {
  describe("Grouping State", () => {
    it("should initialize with empty grouping state", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;
      const groupingState = table.getState().groupingState;

      expect(groupingState.groupOrder).toEqual([]);
      expect(groupingState.groupVisibility).toEqual({});
      expect(groupingState.groupValues).toEqual({});
      expect(groupingState.showAggregates).toBe(true);
      expect(groupingState.hideEmptyGroups).toBe(true);
    });

    it("should populate groupOrder when grouping is set", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.setGrouping(["col2"]);
      });

      const groupingState = table.getState().groupingState;
      expect(groupingState.groupOrder.length).toBeGreaterThan(0);
    });

    it("should populate groupValues when grouping is set", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.setGrouping(["col2"]);
      });

      const groupingState = table.getState().groupingState;
      expect(Object.keys(groupingState.groupValues).length).toBeGreaterThan(0);
    });

    it("should store grouping values correctly", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.setGrouping(["col2"]);
      });

      const groupingState = table.getState().groupingState;
      const groupIds = groupingState.groupOrder;

      groupIds.forEach((groupId) => {
        const groupValue = groupingState.groupValues[groupId];
        expect(groupValue).toBeDefined();
        expect(groupValue?.value).toBeDefined();
        expect(groupValue?.original).toBeDefined();
      });
    });
  });

  describe("Group Visibility", () => {
    it("should toggle individual group visibility", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.setGrouping(["col2"]);
      });

      const groupId = table.getState().groupingState.groupOrder[0]!;

      act(() => {
        table.toggleGroupVisible(groupId);
      });

      const groupVisibility = table.getState().groupingState.groupVisibility;
      expect(groupVisibility[groupId]).toBe(false);

      act(() => {
        table.toggleGroupVisible(groupId);
      });

      const updatedVisibility = table.getState().groupingState.groupVisibility;
      expect(updatedVisibility[groupId]).toBe(true);
    });

    it("should check if some groups are visible", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.setGrouping(["col2"]);
      });

      // Initially all groups should be visible
      expect(table.getIsSomeGroupVisible()).toBe(true);

      // Hide all groups
      const groupIds = table.getState().groupingState.groupOrder;
      act(() => {
        groupIds.forEach((groupId) => {
          table.toggleGroupVisible(groupId);
        });
      });

      expect(table.getIsSomeGroupVisible()).toBe(false);
    });

    it("should toggle all groups visible at once", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.setGrouping(["col2"]);
      });

      const groupIds = table.getState().groupingState.groupOrder;

      // Hide all
      act(() => {
        table.toggleAllGroupsVisible();
      });

      const hiddenVisibility = table.getState().groupingState.groupVisibility;
      groupIds.forEach((groupId) => {
        expect(hiddenVisibility[groupId]).toBe(false);
      });

      // Show all
      act(() => {
        table.toggleAllGroupsVisible();
      });

      const shownVisibility = table.getState().groupingState.groupVisibility;
      groupIds.forEach((groupId) => {
        expect(shownVisibility[groupId]).toBe(true);
      });
    });
  });

  describe("Empty Groups", () => {
    it("should toggle hide empty groups setting", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      const initialState = table.getState().groupingState.hideEmptyGroups;

      act(() => {
        table.toggleHideEmptyGroups();
      });

      const toggledState = table.getState().groupingState.hideEmptyGroups;
      expect(toggledState).toBe(!initialState);
    });

    it("should default to hiding empty groups", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;
      expect(table.getState().groupingState.hideEmptyGroups).toBe(true);
    });
  });

  describe("Aggregate Display", () => {
    it("should toggle show aggregates setting", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.setGrouping(["col2"]);
      });

      const row = table.getGroupedRowModel().rows[0];

      if (row?.getIsGrouped()) {
        const initialState = row.getShouldShowGroupAggregates();

        act(() => {
          row.toggleGroupAggregates();
        });

        const toggledState = row.getShouldShowGroupAggregates();
        expect(toggledState).toBe(!initialState);
      }
    });

    it("should default to showing aggregates", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.setGrouping(["col2"]);
      });

      const row = table.getGroupedRowModel().rows[0];

      if (row?.getIsGrouped()) {
        expect(row.getShouldShowGroupAggregates()).toBe(true);
      }
    });
  });

  describe("Group Column Info", () => {
    it("should get grouped column info", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.setGrouping(["col2"]);
      });

      const groupedColumn = table.getGroupedColumnInfo();
      expect(groupedColumn).toBeDefined();
      expect(groupedColumn?.id).toBe("col2");
    });

    it("should return null when not grouping", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;
      const groupedColumn = table.getGroupedColumnInfo();

      expect(groupedColumn).toBeNull();
    });
  });

  describe("Set Grouping Column", () => {
    it("should set grouping column by id", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.setGroupingColumn("col2");
      });

      const grouping = table.getState().grouping;
      expect(grouping).toEqual(["col2"]);
    });

    it("should clear grouping when set to null", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.setGroupingColumn("col2");
      });

      expect(table.getState().grouping).toHaveLength(1);

      act(() => {
        table.setGroupingColumn(null);
      });

      expect(table.getState().grouping).toEqual([]);
    });

    it("should reset grouping state when changing grouping column", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.setGroupingColumn("col2");
      });

      const firstGroupOrder = table.getState().groupingState.groupOrder;
      expect(firstGroupOrder.length).toBeGreaterThan(0);

      act(() => {
        table.setGroupingColumn(null);
      });

      const clearedGroupOrder = table.getState().groupingState.groupOrder;
      expect(clearedGroupOrder).toEqual([]);
    });
  });

  describe("Group DnD", () => {
    it("should handle group row drag end", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.setGrouping(["col2"]);
      });

      const groupIds = table.getState().groupingState.groupOrder;
      const firstGroupId = groupIds[0]!;
      const secondGroupId = groupIds[1]!;

      const dragEvent = {
        active: { id: firstGroupId, data: { current: {} } },
        over: { id: secondGroupId, data: { current: {} } },
      } as any;

      act(() => {
        table.handleGroupedRowDragEnd(dragEvent);
      });

      const newGroupOrder = table.getState().groupingState.groupOrder;
      const newFirstIndex = newGroupOrder.indexOf(firstGroupId);
      const newSecondIndex = newGroupOrder.indexOf(secondGroupId);

      expect(newFirstIndex).toBeGreaterThan(newSecondIndex);
    });
  });

  describe("Row Group Visibility API", () => {
    it("should toggle group visibility from row", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.setGrouping(["col2"]);
      });

      const groupedRow = table.getGroupedRowModel().rows[0];

      if (groupedRow?.getIsGrouped()) {
        const groupId = groupedRow.id;
        const initialVisibility =
          table.getState().groupingState.groupVisibility[groupId] ?? true;

        act(() => {
          groupedRow.toggleGroupVisibility();
        });

        const newVisibility =
          table.getState().groupingState.groupVisibility[groupId];
        expect(newVisibility).toBe(!initialVisibility);
      }
    });
  });
});
