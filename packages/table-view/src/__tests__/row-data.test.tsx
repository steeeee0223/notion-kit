/**
 * Row Data Tests
 * Tests for row CRUD operations and data state management
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

const mockProperties: ColumnInfo[] = [
  { id: "col1", name: "Name", type: "text", width: 200 },
  { id: "col2", name: "Age", type: "number", width: 100 },
];

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

describe("useTableView - Row Data (Uncontrolled)", () => {
  it("should initialize with provided data", () => {
    const { result } = renderHook(() =>
      useTableView({
        plugins: mockPlugins,
        data: mockData,
        properties: mockProperties,
      }),
    );

    const table = result.current.table;
    const rows = table.getRowModel().rows;

    expect(rows).toHaveLength(2);
    expect(rows[0]?.id).toBe("row1");
    expect(rows[1]?.id).toBe("row2");
  });

  it("should access row data", () => {
    const { result } = renderHook(() =>
      useTableView({
        plugins: mockPlugins,
        data: mockData,
        properties: mockProperties,
      }),
    );

    const table = result.current.table;
    const row = table.getRow("row1");

    expect(row.original.properties.col1?.value).toBe("John");
    expect(row.original.properties.col2?.value).toBe(25);
  });

  it("should add a new row", () => {
    const { result } = renderHook(() =>
      useTableView({
        plugins: mockPlugins,
        data: mockData,
        properties: mockProperties,
      }),
    );

    const table = result.current.table;

    act(() => {
      table.onTableDataChange?.((prev) => [
        ...prev,
        {
          id: "row3",
          properties: {
            col1: { value: "Bob" },
            col2: { value: 35 },
          },
        },
      ]);
    });

    const rows = table.getRowModel().rows;
    expect(rows).toHaveLength(3);
    expect(rows[2]?.id).toBe("row3");
  });

  it("should update a row", () => {
    const { result } = renderHook(() =>
      useTableView({
        plugins: mockPlugins,
        data: mockData,
        properties: mockProperties,
      }),
    );

    const table = result.current.table;

    act(() => {
      table.onTableDataChange?.((prev) =>
        prev.map((row) =>
          row.id === "row1"
            ? {
                ...row,
                properties: {
                  ...row.properties,
                  col1: { value: "Johnny" },
                },
              }
            : row,
        ),
      );
    });

    const row = table.getRow("row1");
    expect(row.original.properties.col1?.value).toBe("Johnny");
  });

  it("should delete a row", () => {
    const { result } = renderHook(() =>
      useTableView({
        plugins: mockPlugins,
        data: mockData,
        properties: mockProperties,
      }),
    );

    const table = result.current.table;

    act(() => {
      table.onTableDataChange?.((prev) =>
        prev.filter((row) => row.id !== "row2"),
      );
    });

    const rows = table.getRowModel().rows;
    expect(rows).toHaveLength(1);
    expect(rows.find((r) => r.id === "row2")).toBeUndefined();
  });

  it("should update cell value", () => {
    const { result } = renderHook(() =>
      useTableView({
        plugins: mockPlugins,
        data: mockData,
        properties: mockProperties,
      }),
    );

    const table = result.current.table;

    act(() => {
      table.onTableDataChange?.((prev) =>
        prev.map((row) =>
          row.id === "row1"
            ? {
                ...row,
                properties: {
                  ...row.properties,
                  col2: { value: 26 },
                },
              }
            : row,
        ),
      );
    });

    const row = table.getRow("row1");
    expect(row.original.properties.col2?.value).toBe(26);
  });
});

describe("useTableView - Row Data (Controlled)", () => {
  it("should use controlled data", () => {
    let data = mockData;
    const onDataChange = vi.fn((updater: any) => {
      data = typeof updater === "function" ? updater(data) : updater;
    });

    const { result, rerender } = renderHook(
      ({ data }) =>
        useTableView({
          plugins: mockPlugins,
          data,
          properties: mockProperties,
          onDataChange,
        }),
      { initialProps: { data: mockData } },
    );

    const table = result.current.table;
    expect(table.getRowModel().rows).toHaveLength(2);

    // Add row externally
    const newData = [
      ...mockData,
      {
        id: "row3",
        properties: {
          col1: { value: "Bob" },
          col2: { value: 35 },
        },
      },
    ];

    rerender({ data: newData });

    expect(result.current.table.getRowModel().rows).toHaveLength(3);
  });

  it("should call onDataChange when updating data", () => {
    const onDataChange = vi.fn();

    const { result } = renderHook(() =>
      useTableView({
        plugins: mockPlugins,
        data: mockData,
        properties: mockProperties,
        onDataChange,
      }),
    );

    const table = result.current.table;

    act(() => {
      table.onTableDataChange?.((prev) =>
        prev.map((row) =>
          row.id === "row1"
            ? {
                ...row,
                properties: {
                  ...row.properties,
                  col1: { value: "Updated" },
                },
              }
            : row,
        ),
      );
    });

    expect(onDataChange).toHaveBeenCalled();
  });

  it("should not directly mutate state in controlled mode", () => {
    const onDataChange = vi.fn();

    const { result } = renderHook(() =>
      useTableView({
        plugins: mockPlugins,
        data: mockData,
        properties: mockProperties,
        onDataChange,
      }),
    );

    const table = result.current.table;
    const initialRows = table.getRowModel().rows;

    act(() => {
      table.onTableDataChange?.((prev) => [
        ...prev,
        {
          id: "row3",
          properties: {
            col1: { value: "New" },
            col2: { value: 40 },
          },
        },
      ]);
    });

    // Rows shouldn't change without external update
    expect(table.getRowModel().rows.length).toBe(initialRows.length);
    expect(onDataChange).toHaveBeenCalled();
  });

  it("should handle batch row updates", () => {
    const onDataChange = vi.fn();

    const { result } = renderHook(() =>
      useTableView({
        plugins: mockPlugins,
        data: mockData,
        properties: mockProperties,
        onDataChange,
      }),
    );

    const table = result.current.table;

    act(() => {
      table.onTableDataChange?.((prev) =>
        prev.map((row) => ({
          ...row,
          properties: {
            ...row.properties,
            col2: { value: (row.properties.col2?.value as number) + 1 },
          },
        })),
      );
    });

    expect(onDataChange).toHaveBeenCalledTimes(1);
  });
});
