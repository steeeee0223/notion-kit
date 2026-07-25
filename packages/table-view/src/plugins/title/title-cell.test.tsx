import { expect, it } from "vitest";

import { mockProperties, mockResizeObserver } from "@/__tests__/mock";
import { renderTableView } from "@/__tests__/component-objects/render-table-view";

mockResizeObserver();

it("TitleCell_QuickActionAppears_AccessibleNameRemainsStable", async () => {
  const table = renderTableView({
    properties: [
      {
        ...mockProperties[0]!,
        type: "title",
        config: { showIcon: true },
      },
      mockProperties[1]!,
    ],
    getRowUrl: (rowId) => `/rows/${rowId}`,
  });
  const title = table.cellButton("Task 1", "Task 1");

  await table.user.hover(table.row("Task 1"));

  expect(title).toHaveAccessibleName("Task 1");
});
