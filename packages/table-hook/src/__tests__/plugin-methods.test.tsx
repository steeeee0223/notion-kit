import { act, render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ColumnInfo, Row } from "@/lib/types";
import { arrayToEntity } from "@/lib/utils";
import { compareNumbers } from "@/methods";
import {
  DefaultGroupingValue,
  type CellPlugin,
  type GroupingValueProps,
} from "@/plugins";
import { createCompareFn } from "@/plugins/utils";
import { useTableView } from "@/table-contexts/use-table-view";

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
      sortedRows.map((row) => {
        const value: unknown = row.original.properties.col1?.value;
        return value;
      }),
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

describe("built-in plugin helpers", () => {
  it("renders boolean and empty grouping labels visibly", () => {
    const table = {} as GroupingValueProps["table"];
    const { rerender } = render(
      <DefaultGroupingValue table={table} value={false} />,
    );
    expect(screen.getByText("False")).toBeTruthy();

    rerender(<DefaultGroupingValue table={table} value={null} />);
    expect(screen.getByText("(Empty)")).toBeTruthy();
  });

  it("sorts rows with missing cells without passing undefined to comparators", () => {
    const compare =
      createCompareFn<CellPlugin<"number", number, undefined>>(compareNumbers);
    const rowWithMissingCell = { properties: {} } as Row;
    const rowWithNumber = {
      id: "row1",
      createdAt: 0,
      lastEditedAt: 0,
      properties: { col1: { id: "cell1", value: 1 } },
    } as Row;

    expect(compare(rowWithMissingCell, rowWithNumber, "col1")).toBeLessThan(0);
    expect(compare(rowWithMissingCell, rowWithMissingCell, "col1")).toBe(0);
  });
});
