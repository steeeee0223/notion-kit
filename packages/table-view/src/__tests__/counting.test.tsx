/**
 * Counting Feature Tests
 * Tests for column counting functionality with all count methods
 */

import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CountMethod } from "../features";
import type { Row } from "../lib/types";
import { mockData, mockProperties, renderTableHook } from "./mock";

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
});
