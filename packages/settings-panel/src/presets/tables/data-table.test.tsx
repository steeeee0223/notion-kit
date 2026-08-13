import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DataTable } from "./data-table";
import type { SettingsColumnDef } from "./table-features";

interface TestRow {
  name: string;
}

const columns: SettingsColumnDef<TestRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
];

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
