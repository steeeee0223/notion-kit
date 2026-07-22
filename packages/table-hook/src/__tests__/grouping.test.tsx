/**
 * Extended Grouping Tests
 * Tests for grouping states, visibility controls, and aggregate display
 */

import type { DragEndEvent } from "@dnd-kit/react";
import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderTableHook } from "@/__tests__/mock";
import type { ColumnInfo, Row } from "@/lib/types";

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

describe("useTableView - Extended Grouping", () => {
  describe("Grouping State", () => {
    it("should initialize with empty grouping state", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      const groupingState = table.store.state.groupingState;

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
      const initialGroupOrder = table.store.state.groupingState.groupOrder;

      act(() => {
        table.setGrouping(["col2"]);
      });

      const groupingState = table.store.state.groupingState;
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

      const groupingState = table.store.state.groupingState;
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

      const groupingState = table.store.state.groupingState;
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

      const hiddenGroupId = table.store.state.groupingState.groupOrder[0]!;

      act(() => {
        table.toggleGroupVisible(hiddenGroupId);
        table.setGrouping(["col2"]);
      });

      expect(table.store.state.groupingState.groupOrder).toContain(
        hiddenGroupId,
      );
      expect(
        table.store.state.groupingState.groupValues[hiddenGroupId],
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

      const groupId = table.store.state.groupingState.groupOrder[0]!;

      act(() => {
        table.toggleGroupVisible(groupId);
      });

      const groupVisibility = table.store.state.groupingState.groupVisibility;
      expect(groupVisibility[groupId]).toBe(false);

      act(() => {
        table.toggleGroupVisible(groupId);
      });

      const updatedVisibility = table.store.state.groupingState.groupVisibility;
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
      const groupIds = table.store.state.groupingState.groupOrder;
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

      const groupIds = table.store.state.groupingState.groupOrder;

      // Hide all
      act(() => {
        table.toggleAllGroupsVisible();
      });

      const hiddenVisibility = table.store.state.groupingState.groupVisibility;
      groupIds.forEach((groupId) => {
        expect(hiddenVisibility[groupId]).toBe(false);
      });

      // Show all
      act(() => {
        table.toggleAllGroupsVisible();
      });

      const shownVisibility = table.store.state.groupingState.groupVisibility;
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

      const initialState = table.store.state.groupingState.hideEmptyGroups;

      act(() => {
        table.toggleHideEmptyGroups();
      });

      const toggledState = table.store.state.groupingState.hideEmptyGroups;
      expect(toggledState).toBe(!initialState);
    });

    it("should default to hiding empty groups", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      expect(table.store.state.groupingState.hideEmptyGroups).toBe(true);
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

      const grouping = table.store.state.grouping;
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

      expect(table.store.state.grouping).toHaveLength(1);

      act(() => {
        table.setGroupingColumn(null);
      });

      expect(table.store.state.grouping).toEqual([]);
    });

    it("should reset grouping state when changing grouping column", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGroupingColumn("col2");
      });

      const firstGroupOrder = table.store.state.groupingState.groupOrder;
      expect(firstGroupOrder.length).toBeGreaterThan(0);

      act(() => {
        table.setGroupingColumn(null);
      });

      const clearedGroupOrder = table.store.state.groupingState.groupOrder;
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

      expect(table.store.state.groupingState.groupOrder.length).toBeGreaterThan(
        0,
      );

      act(() => {
        table.resetGrouping();
      });

      expect(table.store.state.groupingState.groupOrder).toEqual([]);
      expect(table.store.state.groupingState.groupValues).toEqual({});

      act(() => {
        table.setGrouping(["col2"]);
      });

      expect(table.store.state.groupingState.groupOrder.length).toBeGreaterThan(
        0,
      );
      expect(
        Object.keys(table.store.state.groupingState.groupValues).length,
      ).toBeGreaterThan(0);
    });
  });

  describe("Group DnD", () => {
    it("should handle group row drag end", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGrouping(["col2"]);
      });

      const initialGroupOrder = table.store.state.groupingState.groupOrder;

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

      const newGroupOrder = table.store.state.groupingState.groupOrder;

      // Verify the order changed (groups were reordered)
      expect(newGroupOrder).not.toEqual(initialGroupOrder);
      expect(newGroupOrder).toHaveLength(initialGroupOrder.length);

      // Verify both groups are still in the array
      expect(newGroupOrder).toContain(firstGroupId);
      expect(newGroupOrder).toContain(secondGroupId);
    });
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
        table.store.state.groupingState.groupVisibility[groupId] ?? true;

      act(() => {
        groupedRow!.toggleGroupVisibility();
      });

      const newVisibility =
        table.store.state.groupingState.groupVisibility[groupId];
      expect(newVisibility).toBe(!initialVisibility);
    });
  });
});
