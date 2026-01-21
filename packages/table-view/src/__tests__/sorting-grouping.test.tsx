/**
 * Sorting and Grouping Tests
 * Tests for table sorting and grouping functionality
 */

import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ColumnInfo, Row } from "../lib/types";
import { renderTableHook } from "./mock";

const mockProperties: ColumnInfo[] = [
  { id: "col1", name: "Name", type: "text", width: "200", config: undefined },
  { id: "col2", name: "Age", type: "number", width: "100", config: undefined },
  { id: "col3", name: "City", type: "text", width: "150", config: undefined },
];

const mockData: Row[] = [
  {
    id: "row1",
    properties: {
      col1: { value: "John", id: "row1-1" },
      col2: { value: 25, id: "row1-2" },
      col3: { value: "New York", id: "row1-3" },
    },
    createdAt: 0,
    lastEditedAt: 0,
  },
  {
    id: "row2",
    properties: {
      col1: { value: "Alice", id: "row2-1" },
      col2: { value: 30, id: "row2-2" },
      col3: { value: "London", id: "row2-3" },
    },
    createdAt: 0,
    lastEditedAt: 0,
  },
  {
    id: "row3",
    properties: {
      col1: { value: "Bob", id: "row3-1" },
      col2: { value: 20, id: "row3-2" },
      col3: { value: "New York", id: "row3-3" },
    },
    createdAt: 0,
    lastEditedAt: 0,
  },
  {
    id: "row4",
    properties: {
      col1: { value: "Jane", id: "row4-1" },
      col2: { value: 28, id: "row4-2" },
      col3: { value: "Paris", id: "row4-3" },
    },
    createdAt: 0,
    lastEditedAt: 0,
  },
];

describe("useTableView - Sorting", () => {
  it("should initialize without sorting", () => {
    const { table } = renderTableHook({
      data: mockData,
      properties: mockProperties,
    });
    const sorting = table.getState().sorting;

    expect(sorting).toEqual([]);
  });

  it("should sort by text column ascending", () => {
    const { table } = renderTableHook({
      data: mockData,
      properties: mockProperties,
    });

    act(() => {
      table.setSorting([{ id: "col1", desc: false }]);
    });

    const rows = table.getSortedRowModel().rows;
    expect(rows[0]?.original.properties.col1?.value).toBe("Alice");
    expect(rows[1]?.original.properties.col1?.value).toBe("Bob");
    expect(rows[2]?.original.properties.col1?.value).toBe("Jane");
    expect(rows[3]?.original.properties.col1?.value).toBe("John");
  });

  it("should sort by text column descending", () => {
    const { table } = renderTableHook({
      data: mockData,
      properties: mockProperties,
    });

    act(() => {
      table.setSorting([{ id: "col1", desc: true }]);
    });

    const rows = table.getSortedRowModel().rows;
    expect(rows[0]?.original.properties.col1?.value).toBe("John");
    expect(rows[1]?.original.properties.col1?.value).toBe("Jane");
    expect(rows[2]?.original.properties.col1?.value).toBe("Bob");
    expect(rows[3]?.original.properties.col1?.value).toBe("Alice");
  });

  it("should sort by number column ascending", () => {
    const { table } = renderTableHook({
      data: mockData,
      properties: mockProperties,
    });

    act(() => {
      table.setSorting([{ id: "col2", desc: false }]);
    });

    const rows = table.getSortedRowModel().rows;
    expect(rows[0]?.original.properties.col2?.value).toBe(20);
    expect(rows[1]?.original.properties.col2?.value).toBe(25);
    expect(rows[2]?.original.properties.col2?.value).toBe(28);
    expect(rows[3]?.original.properties.col2?.value).toBe(30);
  });

  it("should sort by number column descending", () => {
    const { table } = renderTableHook({
      data: mockData,
      properties: mockProperties,
    });

    act(() => {
      table.setSorting([{ id: "col2", desc: true }]);
    });

    const rows = table.getSortedRowModel().rows;
    expect(rows[0]?.original.properties.col2?.value).toBe(30);
    expect(rows[1]?.original.properties.col2?.value).toBe(28);
    expect(rows[2]?.original.properties.col2?.value).toBe(25);
    expect(rows[3]?.original.properties.col2?.value).toBe(20);
  });

  it("should toggle sorting on same column", () => {
    const { table } = renderTableHook({
      data: mockData,
      properties: mockProperties,
    });

    // First sort: ascending
    act(() => {
      table.getColumn("col2")?.toggleSorting(false);
    });

    let rows = table.getSortedRowModel().rows;
    expect(rows[0]?.original.properties.col2?.value).toBe(20);

    // Second sort: descending
    act(() => {
      table.getColumn("col2")?.toggleSorting(true);
    });

    rows = table.getSortedRowModel().rows;
    expect(rows[0]?.original.properties.col2?.value).toBe(30);

    // Third toggle: clear
    act(() => {
      table.getColumn("col2")?.clearSorting();
    });

    expect(table.getState().sorting).toEqual([]);
  });

  it("should support multi-column sorting", () => {
    const { table } = renderTableHook({
      data: mockData,
      properties: mockProperties,
    });

    act(() => {
      table.setSorting([
        { id: "col3", desc: false }, // Sort by city first
        { id: "col2", desc: false }, // Then by age
      ]);
    });

    const rows = table.getSortedRowModel().rows;
    // Should sort by city, then by age within each city
    expect(rows[0]?.original.properties.col3?.value).toBe("London");
    expect(rows[1]?.original.properties.col3?.value).toBe("New York");
    expect(rows[1]?.original.properties.col2?.value).toBe(20); // Bob
    expect(rows[2]?.original.properties.col3?.value).toBe("New York");
    expect(rows[2]?.original.properties.col2?.value).toBe(25); // John
  });

  it("should clear all sorting", () => {
    const { table } = renderTableHook({
      data: mockData,
      properties: mockProperties,
    });

    act(() => {
      table.setSorting([{ id: "col1", desc: false }]);
    });

    expect(table.getState().sorting).toHaveLength(1);

    act(() => {
      table.resetSorting();
    });

    expect(table.getState().sorting).toEqual([]);
  });
});

describe("useTableView - Grouping", () => {
  it("should initialize without grouping", () => {
    const { table } = renderTableHook({
      data: mockData,
      properties: mockProperties,
    });
    const grouping = table.getState().grouping;

    expect(grouping).toEqual([]);
  });

  it("should group by a column", () => {
    const { table } = renderTableHook({
      data: mockData,
      properties: mockProperties,
    });

    act(() => {
      table.setGrouping(["col3"]); // Group by city
    });

    const groupedRows = table.getGroupedRowModel().rows;

    // Should have group rows
    expect(groupedRows.length).toBeGreaterThan(0);
    expect(table.getState().grouping).toEqual(["col3"]);
  });

  it("should get grouped row values", () => {
    const { table } = renderTableHook({
      data: mockData,
      properties: mockProperties,
    });

    act(() => {
      table.setGrouping(["col3"]);
    });

    const groupedRows = table.getGroupedRowModel().rows;

    // Check first group row has grouping value
    const firstGroup = groupedRows[0];
    if (firstGroup?.getIsGrouped()) {
      const groupValue = firstGroup.getGroupingValue("col3");
      expect(groupValue).toBeDefined();
    }
  });

  it("should clear grouping", () => {
    const { table } = renderTableHook({
      data: mockData,
      properties: mockProperties,
    });

    act(() => {
      table.setGrouping(["col3"]);
    });

    expect(table.getState().grouping).toEqual(["col3"]);

    act(() => {
      table.resetGrouping();
    });

    expect(table.getState().grouping).toEqual([]);
  });
});
