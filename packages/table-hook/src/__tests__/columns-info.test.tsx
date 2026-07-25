/**
 * Column Custom APIs Tests
 * Tests for column CRUD operations using direct table APIs
 */

import type { DragEndEvent } from "@dnd-kit/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  mockData,
  mockProperties,
  plugins,
  renderTableHook,
} from "@/__tests__/mock";
import { useTableView } from "@/table-contexts/use-table-view";

describe("useTableView - Column Custom APIs", () => {
  describe("Column Visibility Source", () => {
    it("should derive initial column visibility from column info", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: [
          mockProperties[0]!,
          { ...mockProperties[1]!, hidden: true },
        ],
      });

      expect(table.getColumnInfo("col2").hidden).toBe(true);
      expect(table.getVisibleLeafColumns().map((column) => column.id)).toEqual([
        "col1",
      ]);
    });

    it("should update column info when core visibility APIs are used", async () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setColumnVisibility({ col1: true, col2: false });
      });

      await waitFor(() => {
        expect(table.getColumnInfo("col2").hidden).toBe(true);
      });
    });

    it("should sync uncontrolled column info when properties props change", () => {
      const { result, rerender } = renderHook(
        ({ properties }) =>
          useTableView({ data: mockData, properties, plugins }),
        { initialProps: { properties: mockProperties } },
      );

      expect(result.current.table.store.state.columnOrder).toEqual([
        "col1",
        "col2",
      ]);

      rerender({
        properties: [
          ...mockProperties,
          {
            id: "col3",
            name: "Email",
            type: "text",
            width: "200",
            config: undefined,
          },
        ],
      });

      expect(result.current.table.store.state.columnOrder).toEqual([
        "col1",
        "col2",
        "col3",
      ]);
    });
  });

  describe("addColumnInfo", () => {
    it("should add a new column at the end by default", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.addColumnInfo({
          id: "col3",
          name: "Email",
          type: "text",
        });
      });

      const columnOrder = table.store.state.columnOrder;
      expect(columnOrder).toContain("col3");
      expect(columnOrder[columnOrder.length - 1]).toBe("col3");
    });

    it("should add column to the right of specified column", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.addColumnInfo({
          id: "col3",
          name: "Email",
          type: "text",
          at: { id: "col1", side: "right" },
        });
      });

      const columnOrder = table.store.state.columnOrder;
      const col1Index = columnOrder.indexOf("col1");
      const col3Index = columnOrder.indexOf("col3");

      expect(col3Index).toBe(col1Index + 1);
    });

    it("should add column to the left of specified column", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.addColumnInfo({
          id: "col3",
          name: "Email",
          type: "text",
          at: { id: "col2", side: "left" },
        });
      });

      const columnOrder = table.store.state.columnOrder;
      const col2Index = columnOrder.indexOf("col2");
      const col3Index = columnOrder.indexOf("col3");

      expect(col3Index).toBe(col2Index - 1);
    });

    it("should add default cell to all existing rows", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

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

    it("should reject duplicate column ids without overwriting existing cells", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      const originalValue = table.getRow("row1").original.properties.col1;

      expect(() => {
        act(() => {
          table.addColumnInfo({
            id: "col1",
            name: "Duplicate",
            type: "text",
          });
        });
      }).toThrow('[TableView] Column already exists: "col1"');

      expect(table.store.state.columnOrder).toEqual(["col1", "col2"]);
      expect(table.getRow("row1").original.properties.col1).toBe(originalValue);
    });

    it("should append when the requested insertion anchor is missing", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.addColumnInfo({
          id: "col3",
          name: "Email",
          type: "text",
          at: { id: "missing", side: "left" },
        });
      });

      expect(table.store.state.columnOrder).toEqual(["col1", "col2", "col3"]);
    });
  });

  describe("removeColumnInfo", () => {
    it("should remove column from column order", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.removeColumnInfo("col2");
      });

      const columnOrder = table.store.state.columnOrder;
      expect(columnOrder).not.toContain("col2");
    });

    it("should remove column from columnsInfo state", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.removeColumnInfo("col2");
      });

      const columnsInfo = table.store.state.columnsInfo;
      expect(columnsInfo.col2).toBeUndefined();
    });

    it("should remove column data from all rows", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

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
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      const originalLength = table.store.state.columnOrder.length;

      act(() => {
        table.duplicateColumnInfo("col1");
      });

      const columnOrder = table.store.state.columnOrder;
      expect(columnOrder.length).toBe(originalLength + 1);
    });

    it("should place duplicated column to the right of original", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.duplicateColumnInfo("col1");
      });

      const columnOrder = table.store.state.columnOrder;
      const col1Index = columnOrder.indexOf("col1");
      const duplicateId = columnOrder[col1Index + 1];

      expect(duplicateId).toBeDefined();
      expect(duplicateId).not.toBe("col1");
    });

    it("should generate unique name for duplicated column", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.duplicateColumnInfo("col1");
      });

      const columnOrder = table.store.state.columnOrder;
      const duplicateId = columnOrder[1]; // Should be right after col1
      const duplicateInfo = table.store.state.columnsInfo[duplicateId!];

      expect(duplicateInfo?.name).not.toBe("Name");
      expect(duplicateInfo?.name).toContain("Name");
    });

    it("should copy column type and config", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      const originalInfo = table.getColumnInfo("col1");

      act(() => {
        table.duplicateColumnInfo("col1");
      });

      const columnOrder = table.store.state.columnOrder;
      const duplicateId = columnOrder[1];
      const duplicateInfo = table.store.state.columnsInfo[duplicateId!];

      expect(duplicateInfo?.type).toBe(originalInfo.type);
    });

    it("should add default cells to all rows for duplicated column", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.duplicateColumnInfo("col1");
      });

      const columnOrder = table.store.state.columnOrder;
      const duplicateId = columnOrder[1];
      const rows = table.getRowModel().rows;

      rows.forEach((row) => {
        expect(row.original.properties[duplicateId!]).toBeDefined();
      });
    });
  });

  describe("handleColumnDragEnd", () => {
    it("ColumnDrag_Canceled_DoesNotEmitPropertyMove", () => {
      const onPropertiesChange = vi.fn();
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
        onPropertiesChange,
      });

      act(() => {
        table.handleColumnDragEnd({
          canceled: true,
          operation: {
            canceled: true,
            source: { id: "col1" },
            target: { id: "col2" },
          },
        } as DragEndEvent);
      });

      expect(onPropertiesChange).not.toHaveBeenCalled();
      expect(table.store.state.columnOrder).toEqual(["col1", "col2"]);
    });

    it("ColumnDrag_MissingSource_DoesNotEmitPropertyMove", () => {
      const onPropertiesChange = vi.fn();
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
        onPropertiesChange,
      });

      act(() => {
        table.handleColumnDragEnd({
          canceled: false,
          operation: {
            canceled: false,
            source: null,
            target: { id: "col2" },
          },
        } as unknown as DragEndEvent);
      });

      expect(onPropertiesChange).not.toHaveBeenCalled();
      expect(table.store.state.columnOrder).toEqual(["col1", "col2"]);
    });

    it("should reorder columns on drag end", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.handleColumnDragEnd({
          canceled: false,
          operation: {
            canceled: false,
            source: { id: "col1" },
            target: { id: "col2" },
          },
        } as DragEndEvent);
      });

      const columnOrder = table.store.state.columnOrder;
      // col1 should have moved after col2
      const col1Index = columnOrder.indexOf("col1");
      const col2Index = columnOrder.indexOf("col2");

      expect(col1Index).toBeGreaterThan(col2Index);
    });

    it("should handle drag to beginning", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.handleColumnDragEnd({
          canceled: false,
          operation: {
            canceled: false,
            source: { id: "col1" },
            target: { id: "col2" },
          },
        } as DragEndEvent);
      });

      const columnOrder = table.store.state.columnOrder;
      expect(columnOrder[0]).toBe("col2");
    });
  });

  describe("Column Info Getters", () => {
    it("should get column info by id", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      const info = table.getColumnInfo("col1");

      expect(info).toBeDefined();
      expect(info.id).toBe("col1");
      expect(info.name).toBe("Name");
      expect(info.type).toBe("text");
    });

    it("should get column plugin by id", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      const plugin = table.getColumnPlugin("col1");

      expect(plugin).toBeDefined();
      expect(plugin.id).toBe("text");
    });

    it("should count visible columns", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      const count = table.countVisibleColumns();

      expect(count).toBe(2);
    });
  });
});
