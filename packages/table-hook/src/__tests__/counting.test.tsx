/**
 * Counting Feature Tests
 * Tests for column counting functionality with all count methods
 */

import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mockData, mockProperties, renderTableHook } from "@/__tests__/mock";
import { CountMethod } from "@/features";
import type { Row } from "@/lib/types";
import { getCalculationRows } from "@/lib/utils";
import { resolveCountingMethod } from "@/methods";

describe("useTableView - Counting Feature", () => {
  describe("Column Counting State", () => {
    it("should get default counting state", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      const counting = table.getColumnCounting("col1");

      expect(counting).toEqual({ method: CountMethod.NONE });
    });

    it("should set column count method", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setColumnCountMethod("col1", CountMethod.ALL);
      });

      const counting = table.getColumnCounting("col1");
      expect(counting.method).toBe(CountMethod.ALL);
    });

    it("should toggle column count capped", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setColumnCountCapped("col1", true);
      });

      const counting = table.getColumnCounting("col1");
      expect(counting.isCapped).toBe(true);

      act(() => {
        table.setColumnCountCapped("col1", (prev) => !prev);
      });

      const updatedCounting = table.getColumnCounting("col1");
      expect(updatedCounting.isCapped).toBe(false);
    });
  });

  describe("Count Methods", () => {
    it("should count all rows (COUNT_ALL)", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setColumnCountMethod("col1", CountMethod.ALL);
      });

      const countResult = table.getColumnCountResult("col1");
      expect(countResult).toBe("3"); // 3 total rows
    });

    it("should count non-empty values (COUNT_VALUES)", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setColumnCountMethod("col1", CountMethod.VALUES);
      });

      const countResult = table.getColumnCountResult("col1");
      expect(countResult).toBe("2"); // 2 non-empty text values
    });

    it("should count empty values (COUNT_EMPTY)", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setColumnCountMethod("col1", CountMethod.EMPTY);
      });

      const countResult = table.getColumnCountResult("col1");
      expect(countResult).toBe("1"); // 1 empty value
    });

    it("should count non-empty values (COUNT_NONEMPTY)", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setColumnCountMethod("col1", CountMethod.NONEMPTY);
      });

      const countResult = table.getColumnCountResult("col1");
      expect(countResult).toBe("2"); // 2 non-empty values
    });

    it("should count checked checkboxes (COUNT_CHECKED)", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setColumnCountMethod("col2", CountMethod.CHECKED);
      });

      const countResult = table.getColumnCountResult("col2");
      expect(countResult).toBe("2"); // 2 checked checkboxes
    });

    it("should count unchecked checkboxes (COUNT_UNCHECKED)", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setColumnCountMethod("col2", CountMethod.UNCHECKED);
      });

      const countResult = table.getColumnCountResult("col2");
      expect(countResult).toBe("1"); // 1 unchecked checkbox
    });

    it("should calculate percentage checked (PERCENTAGE_CHECKED)", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setColumnCountMethod("col2", CountMethod.PERCENTAGE_CHECKED);
      });

      const countResult = table.getColumnCountResult("col2");
      expect(countResult).toContain("66"); // ~66.67%
    });

    it("should calculate percentage unchecked (PERCENTAGE_UNCHECKED)", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setColumnCountMethod("col2", CountMethod.PERCENTAGE_UNCHECKED);
      });

      const countResult = table.getColumnCountResult("col2");
      expect(countResult).toContain("33"); // ~33.33%
    });

    it("should calculate percentage empty (PERCENTAGE_EMPTY)", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setColumnCountMethod("col1", CountMethod.PERCENTAGE_EMPTY);
      });

      const countResult = table.getColumnCountResult("col1");
      expect(countResult).toContain("33"); // ~33.33%
    });

    it("should calculate percentage not empty (PERCENTAGE_NONEMPTY)", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setColumnCountMethod("col1", CountMethod.PERCENTAGE_NONEMPTY);
      });

      const countResult = table.getColumnCountResult("col1");
      expect(countResult).toContain("66"); // ~66.67%
    });

    it("should count unique values (COUNT_UNIQUE)", () => {
      const dataWithDuplicates: Row[] = [
        ...mockData,
        {
          id: "row4",
          createdAt: Date.now(),
          lastEditedAt: Date.now(),
          properties: {
            col1: { id: "cell7", value: "Task 1" }, // Duplicate
            col2: { id: "cell8", value: true },
          },
        },
      ];

      const { table } = renderTableHook({
        data: dataWithDuplicates,
        properties: mockProperties,
      });

      act(() => {
        table.setColumnCountMethod("col1", CountMethod.UNIQUE);
      });

      const countResult = table.getColumnCountResult("col1");
      expect(countResult).toBe("2"); // 2 unique non-empty values: "Task 1", "Task 3"
    });
  });

  describe("Count Method with NONE", () => {
    it("should return empty string for NONE method", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      const countResult = table.getColumnCountResult("col1");
      expect(countResult).toBe("");
    });
  });

  describe("Aggregation Bridge", () => {
    it("returns empty output for unknown and metadata-only counting methods", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      const plugin = table.getColumnPlugin("col1");
      const previousCounting = plugin.counting;
      plugin.counting = [
        {
          group: "Metadata",
          functions: [{ id: "metadata-only", name: "Metadata only" }],
        },
      ];

      try {
        act(() => table.setColumnCountMethod("col1", "missing"));
        expect(table.getColumnCountResult("col1")).toBe("");
        act(() => table.setColumnCountMethod("col1", "metadata-only"));
        expect(table.getColumnCountResult("col1")).toBe("");
      } finally {
        plugin.counting = previousCounting;
      }
    });

    it("preserves capped count output at 99+", () => {
      const rows = Array.from(
        { length: 100 },
        (_, index): Row => ({
          id: `row-${index}`,
          createdAt: 0,
          lastEditedAt: 0,
          properties: {
            col1: { id: `cell-${index}`, value: `Value ${index}` },
          },
        }),
      );
      const { table } = renderTableHook({
        data: rows,
        properties: mockProperties,
      });

      act(() => {
        table.setColumnCountMethod("col1", CountMethod.ALL);
        table.setColumnCountCapped("col1", true);
      });

      expect(table.getColumnCountResult("col1")).toBe("99+");
    });

    it("formats a semantic inline aggregation result at the presentation boundary", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      const plugin = table.getColumnPlugin("col1");
      const previousCounting = plugin.counting;
      plugin.counting = [
        {
          group: "Custom",
          functions: [
            {
              id: "double-count",
              name: "Double count",
              aggregationFn: {
                aggregate: ({ rows }) => rows.length * 2,
              },
              formatResult: (result) => `${String(result)} rows`,
            },
          ],
        },
      ];

      try {
        act(() => {
          table.setColumnCountMethod("col1", "double-count");
        });

        expect(table.getColumnCountResult("col1")).toBe("6 rows");
        const aggregationFn = table.getColumn("col1")?.columnDef.aggregationFn;
        expect(
          typeof aggregationFn === "object" &&
            "aggregate" in aggregationFn &&
            typeof aggregationFn.aggregate === "function",
        ).toBe(true);
      } finally {
        plugin.counting = previousCounting;
      }
    });

    it("stringifies primitive unformatted aggregation results only", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      const plugin = table.getColumnPlugin("col1");
      const previousCounting = plugin.counting;
      plugin.counting = [
        {
          group: "Raw",
          functions: [
            ...(["text", 7, true, { value: 1 }] as const).map(
              (result, index) => ({
                id: `raw-${index}`,
                name: `Raw ${index}`,
                aggregationFn: { aggregate: () => result },
              }),
            ),
          ],
        },
      ];

      try {
        for (const [index, expected] of ["text", "7", "true", ""].entries()) {
          act(() => table.setColumnCountMethod("col1", `raw-${index}`));
          expect(table.getColumnCountResult("col1")).toBe(expected);
        }
      } finally {
        plugin.counting = previousCounting;
      }
    });

    it("uses the pre-grouped row boundary for calculations", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      const preGrouped = table.getPreGroupedRowModel();
      const scopedRows = preGrouped.rows.slice(0, 1);
      const getPreGroupedRowModel = vi.fn(() => ({
        ...preGrouped,
        rows: scopedRows,
      }));
      const getCoreRowModel = vi.fn(() => preGrouped);

      expect(
        getCalculationRows({
          getPreGroupedRowModel,
          getCoreRowModel,
        } as never),
      ).toBe(scopedRows);
      expect(getPreGroupedRowModel).toHaveBeenCalledOnce();
      expect(getCoreRowModel).not.toHaveBeenCalled();
      const aggregationFn = resolveCountingMethod(
        table.getColumnPlugin("col1"),
        CountMethod.ALL,
      )?.aggregationFn;
      expect(aggregationFn).toBe("countAll");
    });
  });
});
