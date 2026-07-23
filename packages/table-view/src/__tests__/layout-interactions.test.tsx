import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { renderTableView } from "./component-objects/render-table-view";
import type { TableViewObject } from "./component-objects/table-view";
import { mockProperties, mockResizeObserver } from "./mock";

mockResizeObserver();

const titleProperties = [
  {
    ...mockProperties[0]!,
    type: "title",
    config: { showIcon: true },
  },
  mockProperties[1]!,
];

async function selectList(tableView: TableViewObject) {
  const settings = await tableView.openViewSettings();
  const layout = await settings.openLayout();
  await layout.selectLayout("List");
  await tableView.clickOutside();
}

async function selectGroupedBoard(tableView: TableViewObject) {
  const settings = await tableView.openViewSettings();
  const grouping = await settings.openSelectGrouping();
  await grouping.select("Done");
  await tableView.clickOutside();

  const groupedSettings = await tableView.openViewSettings();
  const layout = await groupedSettings.openLayout();
  await layout.selectLayout("Board");
  await tableView.clickOutside();
}

it.each([
  ["below", false],
  ["above", true],
] as const)(
  "ListRow_Add%s_CreatesAtExpectedBoundary",
  async (_position, altKey) => {
    const onDataChange = vi.fn();
    const tableView = renderTableView({
      properties: titleProperties,
      onDataChange,
    });
    await selectList(tableView);

    fireEvent.click(screen.getAllByRole("button", { name: "Add row" })[0]!, {
      altKey,
    });

    await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
    expect(onDataChange.mock.calls[0]?.[0].action).toMatchObject({
      type: "data.row.create",
      payload: { nextPosition: altKey ? 0 : 1 },
    });
  },
);

it("ListRow_Click_OpensConfiguredRowView", async () => {
  const tableView = renderTableView({ properties: titleProperties });
  await selectList(tableView);

  await tableView.user.click(
    screen.getAllByRole("button", { name: /Task 1/ })[0]!,
  );

  expect(await screen.findByRole("heading", { name: "Task 1" })).toBeVisible();
});

it("BoardWithoutGrouping_SelectGroupingAction_OpensPropertyPicker", async () => {
  const tableView = renderTableView({ properties: titleProperties });
  const settings = await tableView.openViewSettings();
  const layout = await settings.openLayout();
  await layout.selectLayout("Board");
  await tableView.clickOutside();

  await tableView.user.click(
    screen.getByRole("button", { name: "Select a grouping property" }),
  );

  expect(
    await screen.findByRole("heading", { name: "Group by" }),
  ).toBeVisible();
});

it("BoardCard_EditCommit_UpdatesTitleCellResource", async () => {
  const onDataChange = vi.fn();
  const tableView = renderTableView({
    properties: titleProperties,
    onDataChange,
  });
  await selectGroupedBoard(tableView);
  await tableView.user.click(
    screen.getAllByRole("button", { name: "Edit" })[0]!,
  );
  const input = await screen.findByRole("textbox");

  fireEvent.change(input, { target: { value: "Board task" } });
  fireEvent.keyDown(input, { key: "Enter" });

  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  expect(screen.getByText("Board task")).toBeVisible();
  expect(onDataChange.mock.calls[0]?.[0].action).toMatchObject({
    type: "data.cell.update",
    payload: {
      rowId: "row1",
      propertyId: "col1",
      nextValue: "Board task",
    },
  });
});

it("BoardGroup_NewPage_CreatesRowInsideSelectedGroup", async () => {
  const onDataChange = vi.fn();
  const tableView = renderTableView({
    properties: titleProperties,
    onDataChange,
  });
  await selectGroupedBoard(tableView);
  const group = screen.getAllByRole("group", { name: /^Group / })[0]!;

  fireEvent.click(within(group).getByRole("button", { name: "New page" }));

  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  expect(onDataChange.mock.calls[0]?.[0].action).toMatchObject({
    type: "data.row.create",
  });
});

it("BoardCard_Click_OpensConfiguredRowView", async () => {
  const tableView = renderTableView({ properties: titleProperties });
  await selectGroupedBoard(tableView);

  await tableView.user.click(screen.getByRole("button", { name: /Task 1/ }));

  expect(await screen.findByRole("heading", { name: "Task 1" })).toBeVisible();
});
