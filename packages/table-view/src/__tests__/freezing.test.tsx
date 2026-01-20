/**
 * Freezing Feature Tests
 * Tests for column freezing with pinning integration
 */

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ColumnInfo, Row } from "../lib/types";
import type { Entity } from "../lib/utils";
import { useTableView } from "../table-contexts/use-table-view";

// Mock plugins
const mockPlugins: Entity<any> = {
  ids: ["text"],
  items: {
    text: {
      type: "text",
      name: "Text",
      default: { config: {} },
      compare: (_a: any, _b: any, _colId: string) => 0,
      toValue: (value: any) => String(value ?? ""),
    },
  },
};

const mockProperties: ColumnInfo[] = [
  { id: "col1", name: "Column 1", type: "text", width: 200 },
  { id: "col2", name: "Column 2", type: "text", width: 200 },
  { id: "col3", name: "Column 3", type: "text", width: 200 },
];

const mockData: Row<any>[] = [
  {
    id: "row1",
    createdAt: Date.now(),
    lastEditedAt: Date.now(),
    properties: {
      col1: { id: "cell1", value: "A1" },
      col2: { id: "cell2", value: "B1" },
      col3: { id: "cell3", value: "C1" },
    },
  },
];

describe("useTableView - Freezing Feature", () => {
  describe("Freezing State", () => {
    it("should initialize with no freezing", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;
      const freezingState = table.getFreezingState();

      expect(freezingState).toBeNull();
    });

    it("should set column freezing state", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.setColumnFreezing({ colId: "col1", index: 0 });
      });

      const freezingState = table.getFreezingState();
      expect(freezingState).toEqual({ colId: "col1", index: 0 });
    });

    it("should clear freezing when set to null", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.setColumnFreezing({ colId: "col1", index: 0 });
      });

      expect(table.getFreezingState()).not.toBeNull();

      act(() => {
        table.setColumnFreezing(null);
      });

      expect(table.getFreezingState()).toBeNull();
    });
  });

  describe("Toggle Column Freezed", () => {
    it("should freeze a column", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.toggleColumnFreezed("col1");
      });

      const freezingState = table.getFreezingState();
      expect(freezingState?.colId).toBe("col1");
      expect(freezingState?.index).toBe(0);
    });

    it("should unfreeze a column when toggled again", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      // Freeze
      act(() => {
        table.toggleColumnFreezed("col1");
      });

      expect(table.getFreezingState()).not.toBeNull();

      // Unfreeze
      act(() => {
        table.toggleColumnFreezed("col1");
      });

      expect(table.getFreezingState()).toBeNull();
    });

    it("should freeze different column and replace previous", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      // Freeze col1
      act(() => {
        table.toggleColumnFreezed("col1");
      });

      expect(table.getFreezingState()?.colId).toBe("col1");

      // Freeze col2 (should replace)
      act(() => {
        table.toggleColumnFreezed("col2");
      });

      const freezingState = table.getFreezingState();
      expect(freezingState?.colId).toBe("col2");
      expect(freezingState?.index).toBe(1);
    });
  });

  describe("Can Freeze Column", () => {
    it("should allow freezing non-last columns", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      expect(table.getCanFreezeColumn("col1")).toBe(true);
      expect(table.getCanFreezeColumn("col2")).toBe(true);
    });

    it("should not allow freezing the last column", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      expect(table.getCanFreezeColumn("col3")).toBe(false);
    });
  });

  describe("Pinning Integration", () => {
    it("should update columnPinning when freezing", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.setColumnFreezing({ colId: "col1", index: 0 });
      });

      const columnPinning = table.getState().columnPinning;
      expect(columnPinning.left).toEqual(["col1"]);
    });

    it("should pin multiple columns when freezing at higher index", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.setColumnFreezing({ colId: "col2", index: 1 });
      });

      const columnPinning = table.getState().columnPinning;
      expect(columnPinning.left).toEqual(["col1", "col2"]);
    });

    it("should clear pinning when unfreezing", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.setColumnFreezing({ colId: "col1", index: 0 });
      });

      expect(table.getState().columnPinning.left).toHaveLength(1);

      act(() => {
        table.setColumnFreezing(null);
      });

      const columnPinning = table.getState().columnPinning;
      expect(columnPinning.left).toEqual([]);
    });
  });

  describe("Freezing with Updater Function", () => {
    it("should support updater function for setColumnFreezing", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.setColumnFreezing((prev) => ({
          colId: "col1",
          index: prev === null ? 0 : prev.index + 1,
        }));
      });

      const freezingState = table.getFreezingState();
      expect(freezingState).toEqual({ colId: "col1", index: 0 });
    });

    it("should toggle freezing using updater", () => {
      const { result } = renderHook(() =>
        useTableView({
          plugins: mockPlugins,
          data: mockData,
          properties: mockProperties,
        }),
      );

      const table = result.current.table;

      act(() => {
        table.setColumnFreezing({ colId: "col1", index: 0 });
      });

      act(() => {
        table.setColumnFreezing((prev) =>
          prev === null ? { colId: "col1", index: 0 } : null,
        );
      });

      expect(table.getFreezingState()).toBeNull();
    });
  });
});
