import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import type { Row } from "@notion-kit/table-hook";
import type { DateConfig, DateData } from "@notion-kit/table-hook/plugins";

import { mockResizeObserver } from "@/__tests__/mock";
import { TableViewWrapper } from "@/table-contexts";

import { BulkCheckboxEditor } from "./checkbox";
import { BulkDateEditor } from "./date";
import { BulkSelectEditor } from "./select";
import { selectConfig } from "./select/__tests__/utils";

mockResizeObserver();

const row: Row = {
  id: "row",
  createdAt: 0,
  lastEditedAt: 0,
  properties: {},
};
const dateConfig: DateConfig = {
  dateFormat: "full",
  timeFormat: "24-hour",
  tz: "UTC",
};

it("BulkSelectEditor_MultiSelect_ResolvesOneSharedOverwriteValue", async () => {
  const user = userEvent.setup();
  const onUpdate = vi.fn();
  render(
    <TableViewWrapper
      defaultData={[row]}
      defaultProperties={[
        {
          id: "tags",
          name: "Tags",
          type: "multi-select",
          width: "160",
          config: selectConfig,
        },
      ]}
    >
      <BulkSelectEditor
        multi
        propId="tags"
        config={selectConfig}
        value={[]}
        onUpdate={onUpdate}
      />
    </TableViewWrapper>,
  );

  await user.click(screen.getByRole("option", { name: "Option B" }));

  expect(onUpdate).toHaveBeenCalledExactlyOnceWith(["Option B"]);
});

it("BulkDateEditor_Clear_ResolvesOneCompleteSharedDateValue", async () => {
  const user = userEvent.setup();
  const onUpdate = vi.fn();
  const value: DateData = {
    start: Date.UTC(2025, 0, 15),
    end: Date.UTC(2025, 0, 16),
    endDate: true,
    includeTime: true,
  };
  render(
    <BulkDateEditor data={value} config={dateConfig} onUpdate={onUpdate} />,
  );

  await user.click(screen.getByRole("menuitem", { name: "Clear" }));

  expect(onUpdate).toHaveBeenCalledExactlyOnceWith({
    endDate: true,
    includeTime: true,
    start: undefined,
    end: undefined,
  });
});

it("BulkCheckboxEditor_ExplicitChoices_ResolvesCheckedAndUncheckedValues", async () => {
  const user = userEvent.setup();
  const onUpdate = vi.fn();
  render(<BulkCheckboxEditor onUpdate={onUpdate} />);

  await user.click(screen.getByRole("menuitem", { name: "Checked" }));
  await user.click(screen.getByRole("menuitem", { name: "Unchecked" }));

  expect(onUpdate).toHaveBeenNthCalledWith(1, true);
  expect(onUpdate).toHaveBeenNthCalledWith(2, false);
});
