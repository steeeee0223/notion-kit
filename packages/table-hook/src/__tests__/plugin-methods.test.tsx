import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ColumnInfo, Row } from "../lib/types";
import { arrayToEntity } from "../lib/utils";
import type { CellPlugin } from "../plugins";
import { useTableView } from "../table-contexts/use-table-view";

const reverseTextPlugin: CellPlugin<"reverse-text", string, undefined> = {
  id: "reverse-text",
  meta: {
    name: "Reverse Text",
    desc: "Reverse Text",
    icon: null,
  },
  default: {
    name: "Reverse Text",
    icon: null,
    config: undefined,
    data: "",
  },
  fromValue: (value) => value?.toString() ?? "",
  toValue: (data) => data,
  toTextValue: (data) => data,
  sorting: {
    defaultMethod: "reverse-alpha",
    methods: [
      {
        id: "reverse-alpha",
        name: "Reverse alphabetical",
        function: (rowA, rowB, colId) => {
          const a = rowA.properties[colId]?.value as string;
          const b = rowB.properties[colId]?.value as string;
          return b.localeCompare(a);
        },
      },
    ],
  },
  grouping: {
    defaultMethod: "first-letter",
    methods: [
      {
        id: "first-letter",
        name: "First letter",
        function: (data) => data.charAt(0),
      },
    ],
  },
  counting: [
    {
      group: "Custom",
      functions: [
        {
          id: "filled-with-a",
          name: "Filled with A",
          function: ({ rows, colId }) =>
            rows
              .filter((row) =>
                (row.original.properties[colId]?.value as string).includes("a"),
              )
              .length.toString(),
        },
      ],
    },
  ],
  compare: () => 0,
  renderCell: () => null,
};

const properties: ColumnInfo[] = [
  {
    id: "col1",
    name: "Name",
    type: "reverse-text",
    width: "200",
    config: undefined,
  },
];

const data: Row[] = [
  {
    id: "row1",
    createdAt: 0,
    lastEditedAt: 0,
    properties: { col1: { id: "cell1", value: "Alpha" } },
  },
  {
    id: "row2",
    createdAt: 0,
    lastEditedAt: 0,
    properties: { col1: { id: "cell2", value: "Beta" } },
  },
  {
    id: "row3",
    createdAt: 0,
    lastEditedAt: 0,
    properties: { col1: { id: "cell3", value: "Bravo" } },
  },
];

function renderCustomPluginTable() {
  const plugins = arrayToEntity([reverseTextPlugin]);
  const { result } = renderHook(() =>
    useTableView({ data, properties, plugins }),
  );
  return result.current.table;
}

describe("cell plugin registered methods", () => {
  it("uses plugin default sorting, grouping, and counting methods", () => {
    const table = renderCustomPluginTable();

    act(() => {
      table.setSorting([{ id: "col1", desc: false }]);
    });

    const sortedRows = table.getSortedRowModel().rows;
    expect(
      sortedRows.map((row) => row.original.properties.col1?.value),
    ).toEqual(["Bravo", "Beta", "Alpha"]);

    act(() => {
      table.setGrouping(["col1"]);
    });

    const groupedRows = table.getGroupedRowModel().rows;
    expect(groupedRows.map((row) => row.groupingValue)).toEqual(["A", "B"]);

    act(() => {
      table.setColumnCountMethod("col1", "filled-with-a");
    });

    expect(table.getColumnCountResult("col1")).toBe("3");
  });
});
