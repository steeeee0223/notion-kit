import { render } from "@testing-library/react";

import type { ColumnDefs, Row } from "../../../lib/types";
import { TableView } from "../../../table-contexts";
import type { SelectConfig } from "../types";

const selectConfig: SelectConfig = {
  options: {
    names: ["Option A", "Option B", "Option C"],
    items: {
      "Option A": { id: "opt-a", name: "Option A", color: "blue" },
      "Option B": { id: "opt-b", name: "Option B", color: "green" },
      "Option C": { id: "opt-c", name: "Option C", color: "orange" },
    },
  },
  sort: "manual",
};

const mockProperties: ColumnDefs = [
  {
    id: "title-col",
    type: "title",
    name: "Name",
    width: "200px",
  },
  {
    id: "select-col",
    type: "select",
    name: "Status",
    width: "150px",
    config: selectConfig,
  },
  {
    id: "multi-select-col",
    type: "multi-select",
    name: "Tags",
    width: "200px",
    config: selectConfig,
  },
];

function createMockData(options?: {
  preselected?: "single" | "multi" | "both";
}): Row[] {
  const { preselected } = options ?? {};
  const timeData = { createdAt: Date.now(), lastEditedAt: Date.now() };

  return [
    {
      id: "row-1",
      properties: {
        "title-col": { id: "cell-1-1", value: "Row 1" },
        "select-col": {
          id: "cell-1-2",
          value:
            preselected === "single" || preselected === "both"
              ? "Option A"
              : null,
        },
        "multi-select-col": {
          id: "cell-1-3",
          value:
            preselected === "multi" || preselected === "both"
              ? ["Option A", "Option B"]
              : [],
        },
      },
      ...timeData,
    },
    {
      id: "row-2",
      properties: {
        "title-col": { id: "cell-2-1", value: "Row 2" },
        "select-col": { id: "cell-2-2", value: null },
        "multi-select-col": { id: "cell-2-3", value: [] },
      },
      ...timeData,
    },
  ];
}

interface RenderSelectTableOptions {
  preselected?: "single" | "multi" | "both";
}

export function renderSelectTable(options?: RenderSelectTableOptions) {
  const data = createMockData(options);
  return render(<TableView properties={mockProperties} data={data} />);
}
