// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DataTable, type DataTableProps } from "./data-table";
import type { ColumnDef, Row } from "./table-features";

interface TestRow {
  name: string;
}

const columns: ColumnDef<TestRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    filterFn: (row, columnId, filterValue) =>
      String(row.getValue(columnId)).includes(String(filterValue)),
  },
];

const rowName = (row: Row<TestRow>) => row.original.name;

void rowName;

const sortableColumns: ColumnDef<TestRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <button type="button" onClick={() => column.toggleSorting()}>
        Sort
      </button>
    ),
  },
];

const legacyColumnFilterProps: DataTableProps<TestRow> = {
  columns,
  data: [],
  // @ts-expect-error DataTable filters are controlled by the search prop.
  columnFilters: [],
};

void legacyColumnFilterProps;

describe("DataTable", () => {
  it("renders a search filter without entering an update loop", () => {
    const { rerender } = render(
      <DataTable
        columns={columns}
        data={[{ name: "Ada" }, { name: "Bob" }]}
        search={{ id: "name", value: "Ada" }}
      />,
    );

    expect(screen.getByText("Ada")).toBeTruthy();
    expect(screen.queryByText("Bob")).toBeNull();

    rerender(
      <DataTable
        columns={columns}
        data={[{ name: "Ada" }, { name: "Bob" }]}
        search={{ id: "name", value: "Bob" }}
      />,
    );

    expect(screen.getByText("Bob")).toBeTruthy();
    expect(screen.queryByText("Ada")).toBeNull();
  });

  it("uses TanStack Table internal state for sorting", () => {
    render(
      <DataTable
        columns={sortableColumns}
        data={[{ name: "Bob" }, { name: "Ada" }]}
      />,
    );

    const rows = () =>
      screen
        .getAllByRole("row")
        .slice(1)
        .map((row) => within(row).getByRole("cell").textContent);

    expect(rows()).toEqual(["Bob", "Ada"]);

    fireEvent.click(screen.getByRole("button", { name: "Sort" }));

    expect(rows()).toEqual(["Ada", "Bob"]);
  });
});
