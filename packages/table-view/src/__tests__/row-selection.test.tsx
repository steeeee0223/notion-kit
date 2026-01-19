import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TableView } from "../table-contexts/table-view-provider";
import { createColumnHelper } from "@tanstack/react-table";

// Mock dependencies
vi.mock("@notion-kit/shadcn", () => ({
  TooltipProvider: ({ children }: any) => <>{children}</>,
  Checkbox: ({ checked, onCheckedChange }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      data-testid="row-checkbox"
    />
  ),
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  DropdownMenu: ({ children }: any) => <>{children}</>,
  DropdownMenuTrigger: ({ children }: any) => <>{children}</>,
  DropdownMenuContent: ({ children }: any) => <>{children}</>,
  DropdownMenuItem: ({ children }: any) => <>{children}</>,
}));

vi.mock("@notion-kit/icons", () => ({
  Icon: {
    DragHandle: () => <span>DragHandle</span>,
    Check: () => <span>Check</span>,
  },
}));

vi.mock("@notion-kit/hooks", () => ({
  useIsMobile: () => false,
}));

// Define test data
interface TestData {
  id: string;
  name: string;
}

const columnHelper = createColumnHelper<TestData>();
const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
  }),
];

const data: TestData[] = [
  { id: "row-1", name: "Row 1" },
  { id: "row-2", name: "Row 2" },
];

describe("Row Selection Integration", () => {
  it("syncs table selection state to Selectable item", async () => {
    render(
      <TableView
        data={data}
        columns={columns}
        layout="table"
        onDataChange={() => {}}
      />
    );

    // Initial state: not selected
    const rows = screen.getAllByTestId("row-checkbox");
    expect(rows).toHaveLength(2);
    expect(rows[0]).not.toBeChecked();

    // Find the row element (Selectable.Item)
    // Note: TableRow renders a div with data-block-id={row.id} inside Selectable.Item which passes props to it.
    // Wait, Selectable.Item asChild passes props to the CHILD.
    // So the div with data-block-id should have data-selected.
    const row1 = document.querySelector('[data-block-id="row-1"]');
    expect(row1).toHaveAttribute("data-selected", "false");

    // Click checkbox to select
    fireEvent.click(rows[0]);

    // Expect table state to update (Checkbox checked)
    await waitFor(() => {
      expect(rows[0]).toBeChecked();
    });

    // Expect Selectable integration to update (data-selected="true" on row)
    // This confirms Table -> Provider (value) -> Selectable -> Item flow
    expect(row1).toHaveAttribute("data-selected", "true");
  });
});
