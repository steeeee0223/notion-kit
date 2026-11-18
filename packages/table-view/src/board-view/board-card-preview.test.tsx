import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import type { RowInstance } from "@notion-kit/table-hook";
import type { ComparableValue } from "@notion-kit/table-hook/plugins";

import { BoardCardPreview } from "./board-card";
import { BoardGroupPreview } from "./board-group";

const toTextValue = vi.hoisted(() =>
  vi.fn((value: string[]) => value.join(", ")),
);
vi.mock("@/table-contexts", () => ({
  useTableViewCtx: () => ({
    table: {
      getColumnPlugin: () => ({ default: { data: [] }, toTextValue }),
      getGroupedColumnInfo: () => ({ type: "select" }),
      getGroupingValue: () => "Stale value",
    },
    plugins: {
      getUiPlugin: () => ({
        renderGroupingValue: ({ value }: { value: ComparableValue }) =>
          String(value ?? "Empty"),
      }),
    },
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

it.each(["", "   ", "\n\t", "  Alpha  "])(
  "BoardPreview_Title_%j_UsesPlaceholderOnlyWhenBlank",
  (title) => {
    const row = {
      original: { properties: {} },
      getTitleCell: () => ({ cell: { value: title } }),
      getVisibleCells: () => [],
    } as unknown as RowInstance;
    render(<BoardCardPreview row={row} />);
    expect(screen.getByText(title.trim() || "New page").textContent).toBe(
      title.trim() ? title : "New page",
    );
  },
);

it.each(["Done", null])(
  "BoardGroupPreview_GroupValue_%j_UsesRenderedRow",
  (value) => {
    const row = { groupingValue: value, subRows: [] } as unknown as RowInstance;
    render(<BoardGroupPreview row={row} />);
    expect(screen.getByText(value ?? "Empty")).toBeVisible();
    expect(screen.queryByText("Stale value")).not.toBeInTheDocument();
  },
);
