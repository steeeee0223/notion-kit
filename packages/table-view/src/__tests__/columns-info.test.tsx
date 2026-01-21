/**
 * Column Custom APIs Tests
 * Tests for column CRUD operations using direct table APIs
 */

import type { DragEndEvent } from "@dnd-kit/core";
import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";


import { mockData, mockProperties, renderTableHook } from "./mock";

describe("useTableView - Column Custom APIs", () => {
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

      const columnOrder = table.getState().columnOrder;
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

      const columnOrder = table.getState().columnOrder;
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

      const columnOrder = table.getState().columnOrder;
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

      const columnOrder = table.getState().columnOrder;
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

      const columnsInfo = table.getState().columnsInfo;
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
      const originalLength = table.getState().columnOrder.length;

      act(() => {
        table.duplicateColumnInfo("col1");
      });

      const columnOrder = table.getState().columnOrder;
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

      const columnOrder = table.getState().columnOrder;
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

      const columnOrder = table.getState().columnOrder;
      const duplicateId = columnOrder[1]; // Should be right after col1
      const duplicateInfo = table.getState().columnsInfo[duplicateId!];

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

      const columnOrder = table.getState().columnOrder;
      const duplicateId = columnOrder[1];
      const duplicateInfo = table.getState().columnsInfo[duplicateId!];

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
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      const dragEvent = {
        active: { id: "col1", data: { current: {} } },
        over: { id: "col2", data: { current: {} } },
      } as DragEndEvent;

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
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      const dragEvent = {
        active: { id: "col2", data: { current: {} } },
        over: { id: "col1", data: { current: {} } },
      } as DragEndEvent;

      act(() => {
        table.handleColumnDragEnd(dragEvent);
      });

      const columnOrder = table.getState().columnOrder;
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
