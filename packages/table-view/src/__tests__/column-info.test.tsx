/**
 * Column Info Tests
 * Tests for column CRUD operations and column state management
 */

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ColumnInfo, Row } from "../lib/types";
import type { Entity } from "../lib/utils";
import { useTableView } from "../table-contexts/use-table-view";

// Mock plugins for testing
const mockPlugins: Entity<any> = {
  ids: ["text", "number"],
  items: {
    text: {
      type: "text",
      name: "Text",
      compare: (a: Row<any>, b: Row<any>, colId: string) => 0,
      toValue: (value: any) => String(value ?? ""),
    },
    number: {
      type: "number",
      name: "Number",
      compare: (a: Row<any>, b: Row<any>, colId: string) => 0,
      toValue: (value: any) => Number(value ?? 0),
    },
  },
};

// Mock properties
const mockProperties: ColumnInfo[] = [
  { id: "col1", name: "Name", type: "text", width: 200 },
  { id: "col2", name: "Age", type: "number", width: 100 },
];

// Mock data
const mockData: Row<any>[] = [
  {
    id: "row1",
    properties: {
      col1: { value: "John" },
      col2: { value: 25 },
    },
  },
  {
    id: "row2",
    properties: {
      col1: { value: "Jane" },
      col2: { value: 30 },
    },
  },
];

describe("useTableView - Column Info (Uncontrolled)", () => {
  it("should initialize with provided properties", () => {
    const { result } = renderHook(() =>
      useTableView({
        plugins: mockPlugins,
        data: mockData,
        properties: mockProperties,
      }),
    );

    const table = result.current.table;
    const columnOrder = table.getState().columnOrder;

    expect(columnOrder).toEqual(["col1", "col2"]);
    expect(table.getAllColumns()).toHaveLength(2);
  });

  it("should access column info from state", () => {
    const { result } = renderHook(() =>
      useTableView({
        plugins: mockPlugins,
        data: mockData,
        properties: mockProperties,
      }),
    );

    const table = result.current.table;
    const columnsInfo = table.getState().columnsInfo;

    expect(columnsInfo.col1).toEqual(mockProperties[0]);
    expect(columnsInfo.col2).toEqual(mockProperties[1]);
  });

  it("should update column info (uncontrolled mode)", () => {
    const { result } = renderHook(() =>
      useTableView({
        plugins: mockPlugins,
        data: mockData,
        properties: mockProperties,
      }),
    );

    const table = result.current.table;

    // Update column width
    act(() => {
      table.setColumnInfo("col1", (prev) => ({
        ...prev!,
        width: 300,
      }));
    });

    const updatedInfo = table.getState().columnsInfo.col1;
    expect(updatedInfo?.width).toBe(300);
  });

  it("should add a new column", () => {
    const { result } = renderHook(() =>
      useTableView({
        plugins: mockPlugins,
        data: mockData,
        properties: mockProperties,
      }),
    );

    const table = result.current.table;

    act(() => {
      table.onColumnInfoChange?.((prev) => ({
        ids: [...prev.ids, "col3"],
        items: {
          ...prev.items,
          col3: { id: "col3", name: "Email", type: "text", width: 200 },
        },
      }));
    });

    const columnOrder = table.getState().columnOrder;
    expect(columnOrder).toContain("col3");
    expect(columnOrder).toHaveLength(3);
  });

  it("should remove a column", () => {
    const { result } = renderHook(() =>
      useTableView({
        plugins: mockPlugins,
        data: mockData,
        properties: mockProperties,
      }),
    );

    const table = result.current.table;

    act(() => {
      table.onColumnInfoChange?.((prev) => ({
        ids: prev.ids.filter((id) => id !== "col2"),
        items: Object.fromEntries(
          Object.entries(prev.items).filter(([id]) => id !== "col2"),
        ),
      }));
    });

    const columnOrder = table.getState().columnOrder;
    expect(columnOrder).not.toContain("col2");
    expect(columnOrder).toHaveLength(1);
  });

  it("should reorder columns", () => {
    const { result } = renderHook(() =>
      useTableView({
        plugins: mockPlugins,
        data: mockData,
        properties: mockProperties,
      }),
    );

    const table = result.current.table;

    act(() => {
      table.onColumnInfoChange?.((prev) => ({
        ...prev,
        ids: ["col2", "col1"], // Reverse order
      }));
    });

    const columnOrder = table.getState().columnOrder;
    expect(columnOrder).toEqual(["col2", "col1"]);
  });
});

describe("useTableView - Column Info (Controlled)", () => {
  it("should use controlled properties", () => {
    let properties = mockProperties;
    const onPropertiesChange = vi.fn((updater: any) => {
      properties =
        typeof updater === "function" ? updater(properties) : updater;
    });

    const { result, rerender } = renderHook(
      ({ properties }) =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties,
          onPropertiesChange,
        }),
      { initialProps: { properties: mockProperties } },
    );

    const table = result.current.table;
    expect(table.getState().columnOrder).toEqual(["col1", "col2"]);

    // Update properties externally
    const newProperties = [
      ...mockProperties,
      { id: "col3", name: "Email", type: "text", width: 200 },
    ] as any;

    rerender({ properties: newProperties });

    expect(result.current.table.getState().columnOrder).toEqual([
      "col1",
      "col2",
      "col3",
    ]);
  });

  it("should call onPropertiesChange when updating column info", () => {
    const onPropertiesChange = vi.fn();

    const { result } = renderHook(() =>
      useTableView({
        plugins: mockPlugins,
        data: mockData,
        properties: mockProperties,
        onPropertiesChange,
      }),
    );

    const table = result.current.table;

    act(() => {
      table.setColumnInfo("col1", (prev) => ({
        ...prev!,
        width: 300,
      }));
    });

    expect(onPropertiesChange).toHaveBeenCalled();
  });

  it("should not directly mutate state in controlled mode", () => {
    const onPropertiesChange = vi.fn();

    const { result } = renderHook(() =>
      useTableView({
        plugins: mockPlugins,
        data: mockData,
        properties: mockProperties,
        onPropertiesChange,
      }),
    );

    const table = result.current.table;
    const initialOrder = table.getState().columnOrder;

    act(() => {
      table.onColumnInfoChange?.((prev) => ({
        ...prev,
        ids: ["col2", "col1"],
      }));
    });

    // State shouldn't change without external update
    expect(table.getState().columnOrder).toEqual(initialOrder);
    expect(onPropertiesChange).toHaveBeenCalled();
  });
});
