// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DataTable } from "./data-table";
import type { ColumnDef, Row } from "./table-features";

interface TestRow {
  name: string;
}

const columns: ColumnDef<TestRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
];

const rowName = (row: Row<TestRow>) => row.original.name;

void rowName;

describe("DataTable", () => {
  it("renders a search filter without entering an update loop", () => {
    expect(() =>
      render(
        <DataTable
          columns={columns}
          data={[{ name: "Ada" }]}
          search={{ id: "name", value: "Ada" }}
        />,
      ),
    ).not.toThrow();
  });
});
