import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import type { RowInstance } from "@notion-kit/table-hook";

import { BoardCardPreview } from "./board-card";

const toTextValue = vi.hoisted(() =>
  vi.fn((value: string[]) => value.join(", ")),
);
vi.mock("@/table-contexts", () => ({
  useTableViewCtx: () => ({
    table: { getColumnPlugin: () => ({ default: { data: [] }, toTextValue }) },
  }),
}));

it("BoardPreview_Multiselect_UsesPluginDataAndMissingCellDefaultWithoutEditors", () => {
  const row = {
    original: {
      properties: { tags: { id: "tags-cell", value: ["Planning", "Design"] } },
    },
    getTitleCell: () => ({ cell: { value: "Alpha" } }),
    getVisibleCells: () => [
      { id: "tags", column: { id: "tags" }, getValue: () => "Planning,Design" },
      { id: "missing", column: { id: "missing" }, getValue: () => "" },
    ],
  } as unknown as RowInstance;

  render(<BoardCardPreview row={row} />);

  expect(screen.getByText("Planning, Design")).toBeVisible();
  expect(toTextValue).toHaveBeenCalledWith(
    ["Planning", "Design"],
    row.original,
  );
  expect(toTextValue).toHaveBeenCalledWith([], row.original);
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
});
