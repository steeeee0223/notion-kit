import { fireEvent, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { mockProperties, mockResizeObserver } from "@/__tests__/mock";

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

it("TitleListCell_EditCommit_UpdatesRenderedTitleAndResource", async () => {
  const onDataChange = vi.fn();
  const table = renderTableView({
    properties: [
      {
        ...mockProperties[0]!,
        type: "title",
        config: { showIcon: true },
      },
      mockProperties[1]!,
    ],
    onDataChange,
  });
  const settings = await table.openViewSettings();
  const layout = await settings.openLayout();
  await layout.selectLayout("List");
  await table.clickOutside();

  await table.user.click(screen.getAllByRole("button", { name: "Edit" })[0]!);
  const input = await screen.findByRole("textbox");
  fireEvent.change(input, { target: { value: "Renamed task" } });
  fireEvent.keyDown(input, { key: "Enter" });

  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  expect(screen.getByText("Renamed task")).toBeVisible();
  expect(onDataChange.mock.calls[0]?.[0].action).toMatchObject({
    type: "data.cell.update",
    payload: {
      rowId: "row1",
      propertyId: "col1",
      previousValue: "Task 1",
      nextValue: "Renamed task",
    },
  });
});

it("TitleListCell_EmptyValue_RendersNewPagePlaceholder", async () => {
  const table = renderTableView({
    properties: [
      {
        ...mockProperties[0]!,
        type: "title",
        config: { showIcon: false },
      },
      mockProperties[1]!,
    ],
  });
  const settings = await table.openViewSettings();
  const layout = await settings.openLayout();
  await layout.selectLayout("List");
  await table.clickOutside();

  expect(screen.getByText("New page", { selector: "span" })).toBeVisible();
});
