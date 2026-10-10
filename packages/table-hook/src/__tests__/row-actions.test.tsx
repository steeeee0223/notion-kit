/**
 * Row Custom APIs Tests
 * Tests for row CRUD operations using direct table APIs
 */

import { act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderTableHook } from "@/__tests__/mock";
import type { ColumnInfo, Row } from "@/lib/types";
import type {
  DataResourceAction,
  ResourceChange,
} from "@/table-contexts/actions";

const anyString: unknown = expect.any(String);

const mockProperties: ColumnInfo[] = [
  { id: "col1", name: "Name", type: "text", width: "200", config: undefined },
  { id: "col2", name: "Age", type: "number", width: "100", config: undefined },
];

const mockData: Row[] = [
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

const groupedProperties: ColumnInfo[] = [
  { id: "col1", name: "Name", type: "text", width: "200", config: undefined },
  {
    id: "col2",
    name: "Status",
    type: "select",
    width: "150",
    config: undefined,
  },
];

const groupedData: Row[] = [
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

describe("useTableView - Row Custom APIs", () => {
  describe("addRow", () => {
    it("should add a new row at the end by default", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      const initialLength = table.getRowModel().rows.length;

      act(() => {
        table.addRow();
      });

      const rows = table.getRowModel().rows;
      expect(rows.length).toBe(initialLength + 1);
    });

    it("should add row with default cell values for all columns", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.addRow();
      });

      const rows = table.getRowModel().rows;
      const newRow = rows[rows.length - 1];

      expect(newRow?.original.properties.col1).toBeDefined();
      expect(newRow?.original.properties.col2).toBeDefined();
    });

    it("AddRow_InitialValuesWithPosition_ReturnsTheInsertedRowId", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      let rowId = "";

      act(() => {
        rowId = table.addRow({
          id: "row1",
          at: "next",
          initialValues: { col1: "New row", col2: 0 },
        });
      });

      expect(table.getCoreRowModel().rows.map((row) => row.id)).toEqual([
        "row1",
        rowId,
        "row2",
      ]);
      expect(table.getRow(rowId).original.properties).toEqual({
        col1: { id: anyString, value: "New row" },
        col2: { id: anyString, value: 0 },
      });
    });

    it("should add row before specified row (prev)", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.addRow({ id: "row2", at: "prev" });
      });

      const rows = table.getRowModel().rows;
      const row2Index = rows.findIndex((r) => r.id === "row2");
      const newRowId = rows[row2Index - 1]?.id;

      expect(newRowId).toBeDefined();
      expect(newRowId).not.toBe("row1");
      expect(newRowId).not.toBe("row2");
    });

    it("should set createdAt and lastEditedAt timestamps", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      const beforeAdd = Date.now();

      act(() => {
        table.addRow();
      });

      const rows = table.getRowModel().rows;
      const newRow = rows[rows.length - 1];

      expect(newRow?.original.createdAt).toBeGreaterThanOrEqual(beforeAdd);
      expect(newRow?.original.lastEditedAt).toBeGreaterThanOrEqual(beforeAdd);
    });
  });

  describe("deleteRow", () => {
    it("should remove row by id", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      const initialLength = table.getRowModel().rows.length;

      act(() => {
        table.deleteRow("row1");
      });

      const rows = table.getRowModel().rows;
      expect(rows.length).toBe(initialLength - 1);
      expect(rows.find((r) => r.id === "row1")).toBeUndefined();
    });

    it("should not affect other rows", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.deleteRow("row1");
      });

      const rows = table.getRowModel().rows;
      expect(rows.find((r) => r.id === "row2")).toBeDefined();
    });
  });

  describe("deleteRows", () => {
    it("should delete multiple rows by ids", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.deleteRows(["row1", "row2"]);
      });

      const rows = table.getRowModel().rows;
      expect(rows.length).toBe(0);
    });

    it("should handle partial deletion", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.deleteRows(["row1"]);
      });

      const rows = table.getRowModel().rows;
      expect(rows.length).toBe(1);
      expect(rows[0]?.id).toBe("row2");
    });
  });

  describe("duplicateRow", () => {
    it("should create a copy of the row", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      const initialLength = table.getRowModel().rows.length;

      act(() => {
        table.duplicateRow("row1");
      });

      const rows = table.getRowModel().rows;
      expect(rows.length).toBe(initialLength + 1);
    });

    it("should place duplicated row right after original", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.duplicateRow("row1");
      });

      const rows = table.getRowModel().rows;
      const row1Index = rows.findIndex((r) => r.id === "row1");
      const duplicateRow = rows[row1Index + 1];

      expect(duplicateRow).toBeDefined();
      expect(duplicateRow?.id).not.toBe("row1");
    });

    it("should copy cell values from original row", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.duplicateRow("row1");
      });

      const rows = table.getRowModel().rows;
      const row1 = rows.find((r) => r.id === "row1");
      const duplicate = rows[1]; // Should be right after row1

      expect(duplicate?.original.properties.col1?.value).toBe(
        row1?.original.properties.col1?.value,
      );
      expect(duplicate?.original.properties.col2?.value).toBe(
        row1?.original.properties.col2?.value,
      );
    });

    it("should generate new cell ids for duplicated row", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.duplicateRow("row1");
      });

      const rows = table.getRowModel().rows;
      const row1 = rows.find((r) => r.id === "row1");
      const duplicate = rows[1];

      expect(duplicate?.original.properties.col1?.id).not.toBe(
        row1?.original.properties.col1?.id,
      );
    });

    it("should update timestamps for duplicated row", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      const beforeDuplicate = Date.now();

      act(() => {
        table.duplicateRow("row1");
      });

      const rows = table.getRowModel().rows;
      const duplicate = rows[1];

      expect(duplicate?.original.createdAt).toBeGreaterThanOrEqual(
        beforeDuplicate,
      );
      expect(duplicate?.original.lastEditedAt).toBeGreaterThanOrEqual(
        beforeDuplicate,
      );
    });

    it("DuplicateRows_MixedTargetIds_DuplicatesSourcesInDataOrderWithOneBatchAction", () => {
      const onDataChange =
        vi.fn<(change: ResourceChange<Row[], DataResourceAction>) => void>();
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
        onDataChange,
      });
      const beforeDuplicate = Date.now();

      act(() => {
        table.duplicateRows(["row2", "missing", "row1"]);
      });

      const rows = table.getRowModel().rows;
      const firstDuplicate = rows[1]!;
      const secondDuplicate = rows[3]!;

      expect(rows.map((row) => row.id)).toEqual([
        "row1",
        firstDuplicate.id,
        "row2",
        secondDuplicate.id,
      ]);
      expect(firstDuplicate.original.properties.col1?.value).toBe("John");
      expect(secondDuplicate.original.properties.col1?.value).toBe("Jane");
      expect(firstDuplicate.original.properties.col1?.id).not.toBe("cell1");
      expect(secondDuplicate.original.properties.col1?.id).not.toBe("cell3");
      expect(firstDuplicate.original.createdAt).toBeGreaterThanOrEqual(
        beforeDuplicate,
      );
      expect(secondDuplicate.original.lastEditedAt).toBeGreaterThanOrEqual(
        beforeDuplicate,
      );
      expect(onDataChange).toHaveBeenCalledOnce();
      expect(onDataChange.mock.lastCall?.[0].action).toEqual({
        id: anyString,
        type: "data.rows.duplicate",
        payload: {
          duplicates: [
            {
              sourceRowId: "row1",
              rowId: firstDuplicate.id,
              nextPosition: 1,
            },
            {
              sourceRowId: "row2",
              rowId: secondDuplicate.id,
              nextPosition: 3,
            },
          ],
        },
      });
    });
  });

  describe("Cell APIs", () => {
    it("should get cell by column and row id", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      const cell = table.getCell("col1", "row1");

      expect(cell).toBeDefined();
      expect(cell.value).toBe("John");
    });

    it("should update cell value", async () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.updateCell("row1", "col1", (prev) => ({
          ...prev,
          value: "Updated",
        }));
      });

      // Wait for queued update to complete
      await waitFor(() => {
        const cell = table.getCell("col1", "row1");
        expect(cell.value).toBe("Updated");
      });
    });

    it("UpdateCells_MixedTargetIds_UpdatesExistingRowsInOneBatch", async () => {
      const onDataChange =
        vi.fn<(change: ResourceChange<Row[], DataResourceAction>) => void>();
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
        onDataChange,
      });
      const beforeUpdate = Date.now();

      act(() => {
        table.updateCells(["row2", "missing", "row1"], "col1", "Updated");
      });

      await waitFor(() => {
        expect(table.getCell("col1", "row1").value).toBe("Updated");
        expect(table.getCell("col1", "row2").value).toBe("Updated");
      });

      expect(table.getCell("col2", "row1").value).toBe(25);
      expect(table.getCell("col2", "row2").value).toBe(30);
      expect(table.getRow("row1").original.lastEditedAt).toBeGreaterThanOrEqual(
        beforeUpdate,
      );
      expect(table.getRow("row2").original.lastEditedAt).toBeGreaterThanOrEqual(
        beforeUpdate,
      );
      expect(onDataChange).toHaveBeenCalledOnce();
      expect(onDataChange.mock.lastCall?.[0].action).toEqual({
        id: anyString,
        type: "data.cell.update",
        payload: {
          rowIds: ["row1", "row2"],
          propertyId: "col1",
        },
      });
    });

    it("should ignore updates for missing cells", () => {
      const { table } = renderTableHook({
        data: [
          {
            ...mockData[0]!,
            properties: { col1: mockData[0]!.properties.col1! },
          },
        ],
        properties: mockProperties,
      });

      expect(() => {
        act(() => {
          table.updateCell("row1", "col2", (prev) => ({
            ...prev,
            value: 42,
          }));
        });
      }).not.toThrow();

      expect(table.getRow("row1").original.properties.col2).toBeUndefined();
    });

    it("should update lastEditedAt timestamp when cell changes", async () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });
      const beforeUpdate = Date.now();

      act(() => {
        table.updateCell("row1", "col1", (prev) => ({
          ...prev,
          value: "Updated",
        }));
      });

      // Wait for queued update to complete
      await waitFor(() => {
        const row = table.getRow("row1");
        expect(row.original.lastEditedAt).toBeGreaterThanOrEqual(beforeUpdate);
      });
    });

    it("should refresh grouping values after grouped cell edits", async () => {
      const { table } = renderTableHook({
        data: groupedData,
        properties: groupedProperties,
      });

      act(() => {
        table.setGrouping(["col2"]);
      });

      const todoGroupId = table.atoms.groupingState
        .get()
        .groupOrder.find(
          (groupId) =>
            table.atoms.groupingState.get().groupValues[groupId]?.value ===
            "TODO",
        );
      expect(todoGroupId).toBeDefined();

      act(() => {
        table.updateCell(
          "row1",
          "col2",
          (prev) => ({
            ...prev,
            value: { name: "DONE" },
          }),
          todoGroupId,
        );
        table.updateCell(
          "row2",
          "col2",
          (prev) => ({
            ...prev,
            value: { name: "DONE" },
          }),
          todoGroupId,
        );
      });

      await waitFor(() => {
        const groupValues = Object.values(
          table.atoms.groupingState.get().groupValues,
        ).map((group) => group.value);
        expect(groupValues).toEqual(["DONE"]);
      });
    });

    it("UpdateCells_GroupedColumn_RefreshesGroupsAfterOneBatch", async () => {
      const { table } = renderTableHook({
        data: groupedData,
        properties: groupedProperties,
      });

      act(() => {
        table.setGrouping(["col2"]);
      });

      act(() => {
        table.updateCells(["row1", "row2"], "col2", { name: "DONE" });
      });

      await waitFor(() => {
        const groupValues = Object.values(
          table.atoms.groupingState.get().groupValues,
        ).map((group) => group.value);
        expect(groupValues).toEqual(["DONE"]);
      });
    });
  });
});
