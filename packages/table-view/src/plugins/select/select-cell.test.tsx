import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import type { Row } from "@notion-kit/table-hook";

import { TableViewWrapper } from "@/table-contexts";

import { selectConfig } from "./__tests__/utils";
import { SelectCellEditor } from "./select-cell";

const row: Row = {
  id: "row",
  createdAt: 0,
  lastEditedAt: 0,
  properties: {},
};

it("SelectCellEditor_InvalidMultiSelectDraft_UsesAnEmptyOptionList", () => {
  render(
    <TableViewWrapper defaultData={[row]} defaultProperties={[]}>
      <SelectCellEditor
        multi
        propId="tags"
        config={selectConfig}
        data={null as unknown as string[]}
        onChange={vi.fn()}
        scope={{ kind: "bulk", rowIds: ["row"], selectedValues: [] }}
      />
    </TableViewWrapper>,
  );

  expect(screen.getByRole("combobox")).toHaveValue("");
});
