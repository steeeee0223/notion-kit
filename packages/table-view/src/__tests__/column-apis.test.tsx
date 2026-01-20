/**
 * Column Custom APIs Tests
 * Tests for column CRUD operations using direct table APIs
 */

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ColumnInfo, Row } from "../lib/types";
import type { Entity } from "../lib/utils";
import { useTableView } from "../table-contexts/use-table-view";

// Mock plugins with proper structure
const mockPlugins: Entity<any> = {
  ids: ["text", "number"],
  items: {
    text: {
      id: "text",
      type: "text",
      name: "Text",
      default: { config: {} },
      compare: (_a: any, _b: any, _colId: string) => 0,
      toValue: (value: any) => String(value ?? ""),
      fromValue: (value: any) => String(value ?? ""),
    },
    number: {
      id: "number",
      type: "number",
      name: "Number",
      default: { config: {} },
      compare: (_a: any, _b: any, _colId: string) => 0,
      toValue: (value: any) => Number(value ?? 0),
      fromValue: (value: any) => Number(value ?? 0),
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
    createdAt: Date.now(),
    lastEditedAt: Date.now(),
    properties: {
      col1: { id: "cell1", value: "John" },
      col2: { id: "cell2", value: 25 },
    },
  },
  {
    id: "row2",
    createdAt: Date.now(),
    lastEditedAt: Date.now(),
    properties: {
      col1: { id: "cell3", value: "Jane" },
      col2: { id: "cell4", value: 30 },
    },
  },
];

describe("useTableView - Column Custom APIs", () => {
  describe("addColumnInfo", () => {
    it("should add a new column at the end by default", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.addColumnInfo({
          id: "col3",
          name: "Email",
          type: "text",
        });
      });

      const columnOrder = table.getState().columnOrder;
      expect(columnOrder).toContain("col3");
      expect(columnOrder[columnOrder.length - 1]).toBe("col3");
    });

    it("should add column to the right of specified column", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.addColumnInfo({
          id: "col3",
          name: "Email",
          type: "text",
          at: { id: "col1", side: "right" },
        });
      });

      const columnOrder = table.getState().columnOrder;
      const col1Index = columnOrder.indexOf("col1");
      const col3Index = columnOrder.indexOf("col3");

      expect(col3Index).toBe(col1Index + 1);
    });

    it("should add column to the left of specified column", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.addColumnInfo({
          id: "col3",
          name: "Email",
          type: "text",
          at: { id: "col2", side: "left" },
        });
      });

      const columnOrder = table.getState().columnOrder;
      const col2Index = columnOrder.indexOf("col2");
      const col3Index = columnOrder.indexOf("col3");

      expect(col3Index).toBe(col2Index - 1);
    });

    it("should add default cell to all existing rows", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.addColumnInfo({
          id: "col3",
          name: "Email",
          type: "text",
        });
      });

      const rows = table.getRowModel().rows;
      rows.forEach((row) => {
        expect(row.original.properties.col3).toBeDefined();
        expect(row.original.properties.col3?.value).toBeDefined();
      });
    });
  });

  describe("removeColumnInfo", () => {
    it("should remove column from column order", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.removeColumnInfo("col2");
      });

      const columnOrder = table.getState().columnOrder;
      expect(columnOrder).not.toContain("col2");
    });

    it("should remove column from columnsInfo state", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.removeColumnInfo("col2");
      });

      const columnsInfo = table.getState().columnsInfo;
      expect(columnsInfo.col2).toBeUndefined();
    });

    it("should remove column data from all rows", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.removeColumnInfo("col2");
      });

      const rows = table.getRowModel().rows;
      rows.forEach((row) => {
        expect(row.original.properties.col2).toBeUndefined();
      });
    });
  });

  describe("duplicateColumnInfo", () => {
    it("should create a new column with duplicated config", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;
      const originalLength = table.getState().columnOrder.length;

      act(() => {
        table.duplicateColumnInfo("col1");
      });

      const columnOrder = table.getState().columnOrder;
      expect(columnOrder.length).toBe(originalLength + 1);
    });

    it("should place duplicated column to the right of original", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.duplicateColumnInfo("col1");
      });

      const columnOrder = table.getState().columnOrder;
      const col1Index = columnOrder.indexOf("col1");
      const duplicateId = columnOrder[col1Index + 1];

      expect(duplicateId).toBeDefined();
      expect(duplicateId).not.toBe("col1");
    });

    it("should generate unique name for duplicated column", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.duplicateColumnInfo("col1");
      });

      const columnOrder = table.getState().columnOrder;
      const duplicateId = columnOrder[1]; // Should be right after col1
      const duplicateInfo = table.getState().columnsInfo[duplicateId!];

      expect(duplicateInfo?.name).not.toBe("Name");
      expect(duplicateInfo?.name).toContain("Name");
    });

    it("should copy column type and config", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;
      const originalInfo = table.getColumnInfo("col1");

      act(() => {
        table.duplicateColumnInfo("col1");
      });

      const columnOrder = table.getState().columnOrder;
      const duplicateId = columnOrder[1];
      const duplicateInfo = table.getState().columnsInfo[duplicateId!];

      expect(duplicateInfo?.type).toBe(originalInfo.type);
    });

    it("should add default cells to all rows for duplicated column", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.duplicateColumnInfo("col1");
      });

      const columnOrder = table.getState().columnOrder;
      const duplicateId = columnOrder[1];
      const rows = table.getRowModel().rows;

      rows.forEach((row) => {
        expect(row.original.properties[duplicateId!]).toBeDefined();
      });
    });
  });

  describe("handleColumnDragEnd", () => {
    it("should reorder columns on drag end", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      const dragEvent = {
        active: { id: "col1", data: { current: {} } },
        over: { id: "col2", data: { current: {} } },
      } as any;

      act(() => {
        table.handleColumnDragEnd(dragEvent);
      });

      const columnOrder = table.getState().columnOrder;
      // col1 should have moved after col2
      const col1Index = columnOrder.indexOf("col1");
      const col2Index = columnOrder.indexOf("col2");

      expect(col1Index).toBeGreaterThan(col2Index);
    });

    it("should handle drag to beginning", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      const dragEvent = {
        active: { id: "col2", data: { current: {} } },
        over: { id: "col1", data: { current: {} } },
      } as any;

      act(() => {
        table.handleColumnDragEnd(dragEvent);
      });

      const columnOrder = table.getState().columnOrder;
      expect(columnOrder[0]).toBe("col2");
    });
  });

  describe("Column Info Getters", () => {
    it("should get column info by id", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;
      const info = table.getColumnInfo("col1");

      expect(info).toBeDefined();
      expect(info.id).toBe("col1");
      expect(info.name).toBe("Name");
      expect(info.type).toBe("text");
    });

    it("should get column plugin by id", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;
      const plugin = table.getColumnPlugin("col1");

      expect(plugin).toBeDefined();
      expect(plugin.type).toBe("text");
    });

    it("should count visible columns", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;
      const count = table.countVisibleColumns();

      expect(count).toBe(2);
    });
  });
});
