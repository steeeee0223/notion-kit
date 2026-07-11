/**
 * Row Custom APIs Tests
 * Tests for row CRUD operations using direct table APIs
 */

import type { DragEndEvent, DragOverEvent } from "@dnd-kit/react";
import { act, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderTableHook } from "@/__tests__/mock";
import type { ColumnInfo, Row } from "@/lib/types";

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

    it("should add row after specified row (next)", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.addRow({ id: "row1", at: "next" });
      });

      const rows = table.getRowModel().rows;
      const row1Index = rows.findIndex((r) => r.id === "row1");
      const newRowId = rows[row1Index + 1]?.id;

      expect(newRowId).toBeDefined();
      expect(newRowId).not.toBe("row1");
      expect(newRowId).not.toBe("row2");
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
  });

  describe("handleRowDragEnd", () => {
    it("should reorder rows on drag end", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.handleRowDragEnd({
          canceled: false,
          operation: {
            canceled: false,
            source: { id: "row1" },
            target: { id: "row2" },
          },
        } as DragEndEvent);
      });

      const rows = table.getRowModel().rows;
      // row1 should have moved after row2
      const row1Index = rows.findIndex((r) => r.id === "row1");
      const row2Index = rows.findIndex((r) => r.id === "row2");

      expect(row1Index).toBeGreaterThan(row2Index);
    });

    it("should handle drag to beginning", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.handleRowDragEnd({
          canceled: false,
          operation: {
            canceled: false,
            source: { id: "row1" },
            target: { id: "row2" },
          },
        } as DragEndEvent);
      });

      const rows = table.getRowModel().rows;
      expect(rows[0]?.id).toBe("row2");
    });

    it("updates row grouping from kanban column drag metadata", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGrouping(["col2"]);
      });

      act(() => {
        table.handleRowDragEnd({
          canceled: false,
          operation: {
            canceled: false,
            source: { id: "row1", data: { columnId: "col2:25" } },
            target: { id: "row2", data: { columnId: "col2:30" } },
          },
        } as unknown as DragEndEvent);
      });

      expect(table.getRow("row1").original.properties.col2?.value).toBe(30);
    });

    it("can commit row grouping without replaying a kanban preview reorder", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGrouping(["col2"]);
      });

      act(() => {
        table.handleRowDragEnd(
          {
            canceled: false,
            operation: {
              canceled: false,
              source: { id: "row1", data: { columnId: "col2:25" } },
              target: { id: "row2", data: { columnId: "col2:30" } },
            },
          } as unknown as DragEndEvent,
          { reorder: false },
        );
      });

      expect(table.getCellValues().map((row) => row.id)).toEqual([
        "row1",
        "row2",
      ]);
      expect(table.getRow("row1").original.properties.col2?.value).toBe(30);
    });

    it("previews kanban row order directly in table data", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGrouping(["col2"]);
      });

      act(() => {
        table.handleKanbanRowDragOver({
          canceled: false,
          operation: {
            canceled: false,
            source: {
              id: "row1",
              type: "item",
              data: { columnId: "col2:25" },
              manager: {
                dragOperation: {
                  position: { current: { x: 0, y: 0 } },
                },
              },
            },
            target: { id: "row2", type: "item", data: { columnId: "col2:30" } },
          },
        } as unknown as DragOverEvent);
      });

      const targetGroup = table.getGroupedRowModel().rowsById["col2:30"];

      expect(targetGroup?.subRows.map((row) => row.id)).toEqual([
        "row1",
        "row2",
      ]);
      expect(table.getRow("row1").original.properties.col2?.value).toBe(30);
    });

    it("rolls back kanban row preview when drag is canceled", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGrouping(["col2"]);
      });

      act(() => {
        table.handleKanbanRowDragOver({
          canceled: false,
          operation: {
            canceled: false,
            source: {
              id: "row1",
              type: "item",
              data: { columnId: "col2:25" },
              manager: {
                dragOperation: {
                  position: { current: { x: 0, y: 0 } },
                },
              },
            },
            target: { id: "row2", type: "item", data: { columnId: "col2:30" } },
          },
        } as unknown as DragOverEvent);
      });

      expect(table.getRow("row1").original.properties.col2?.value).toBe(30);

      act(() => {
        table.handleRowDragEnd({
          canceled: true,
          operation: {
            canceled: true,
            source: { id: "row1" },
            target: { id: "row2" },
          },
        } as DragEndEvent);
      });

      expect(table.getRow("row1").original.properties.col2?.value).toBe(25);
      expect(table.getRow("row2").original.properties.col2?.value).toBe(30);
    });

    it("moves a kanban row into an emptied column-content target", () => {
      const { table } = renderTableHook({
        data: mockData,
        properties: mockProperties,
      });

      act(() => {
        table.setGrouping(["col2"]);
      });

      act(() => {
        table.handleKanbanRowDragOver({
          canceled: false,
          operation: {
            canceled: false,
            source: {
              id: "row1",
              type: "item",
              data: { columnId: "col2:25" },
            },
            target: {
              id: "content:col2:30",
              type: "column-content",
              data: { columnId: "col2:30" },
            },
          },
        } as unknown as DragOverEvent);
      });

      expect(
        table.getGroupedRowModel().rowsById["col2:25"]?.subRows ?? [],
      ).toHaveLength(0);

      act(() => {
        table.handleKanbanRowDragOver({
          canceled: false,
          operation: {
            canceled: false,
            source: {
              id: "row2",
              type: "item",
              data: { columnId: "col2:30" },
            },
            target: {
              id: "content:col2:25",
              type: "column-content",
              data: { columnId: "col2:25" },
            },
          },
        } as unknown as DragOverEvent);
      });

      const emptiedGroup = table.getGroupedRowModel().rowsById["col2:25"];
      const sourceGroup = table.getGroupedRowModel().rowsById["col2:30"];

      expect(emptiedGroup?.subRows.map((row) => row.id)).toEqual(["row2"]);
      expect(sourceGroup?.subRows.map((row) => row.id)).toEqual(["row1"]);
      expect(table.getRow("row2").original.properties.col2?.value).toBe(25);
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

      const todoGroupId = table.store.state.groupingState.groupOrder.find(
        (groupId) =>
          table.store.state.groupingState.groupValues[groupId]?.value ===
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
          table.store.state.groupingState.groupValues,
        ).map((group) => group.value);
        expect(groupValues).toEqual(["DONE"]);
      });
    });
  });
});
