import { screen, waitFor, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import type { Row } from "@notion-kit/table-hook";

import {
  findMenuByHeading,
  findMenuByItem,
} from "@/__tests__/component-objects/menu-surface";
import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import type { TableViewObject } from "@/__tests__/component-objects/table-view";
import { mockData, mockProperties, mockResizeObserver } from "@/__tests__/mock";

mockResizeObserver();

async function openHeader(tableView: TableViewObject, name: string) {
  const header = screen.getByRole("button", { name });
  if (header.getAttribute("aria-expanded") === "true") {
    await tableView.user.click(header);
    await waitFor(() =>
      expect(header).toHaveAttribute("aria-expanded", "false"),
    );
  }
  await tableView.user.click(header);
  return findMenuByItem("Calculate");
}

async function reopenHeader(tableView: TableViewObject, name: string) {
  return openHeader(tableView, name);
}

it("PropMenu_Wrap_TogglesObservableHeaderState", async () => {
  const tableView = renderTableView();

  let menu = await openHeader(tableView, "Name");
  await tableView.user.click(
    within(menu).getByRole("menuitem", { name: "Wrap text" }),
  );
  menu = await reopenHeader(tableView, "Name");
  expect(
    within(menu).getByRole("menuitem", { name: "Unwrap text" }),
  ).toBeVisible();
});

it("PropMenu_Rename_UpdatesHeaderAndReportsPropertyChange", async () => {
  const onPropertiesChange = vi.fn();
  const tableView = renderTableView({ onPropertiesChange });
  const menu = await openHeader(tableView, "Name");
  const name = within(menu).getByDisplayValue("Name");

  await tableView.user.clear(name);
  await tableView.user.type(name, "Owner");
  await tableView.user.tab();

  expect(screen.getByRole("button", { name: "Owner" })).toBeVisible();
  expect(onPropertiesChange).toHaveBeenLastCalledWith(
    expect.objectContaining({
      action: expect.objectContaining({ type: "properties.update" }),
    }),
  );
});

it("PropMenu_DuplicateName_ShowsValidationWithoutChangingHeader", async () => {
  const tableView = renderTableView();
  const menu = await openHeader(tableView, "Name");
  const name = within(menu).getByDisplayValue("Name");

  await tableView.user.clear(name);
  await tableView.user.type(name, "Done");
  await tableView.user.tab();

  expect(
    within(menu).getByText(/A property named Done already exists/),
  ).toBeVisible();
  expect(screen.getByRole("button", { name: "Name" })).toBeVisible();
});

it("PropMenu_DescriptionToggle_UpdatesPropertyMetadata", async () => {
  const onPropertiesChange = vi.fn();
  const tableView = renderTableView({ onPropertiesChange });
  const menu = await openHeader(tableView, "Name");

  await tableView.user.click(
    menu.querySelector<HTMLElement>('[aria-label="Add property description"]')!,
  );
  const description = within(menu).getByPlaceholderText("Add a description...");
  await tableView.user.type(description, "Primary task name");
  await tableView.user.tab();

  expect(onPropertiesChange).toHaveBeenLastCalledWith(
    expect.objectContaining({
      action: expect.objectContaining({ type: "properties.update" }),
      next: expect.arrayContaining([
        expect.objectContaining({ description: "Primary task name" }),
      ]),
    }),
  );
});

it("PropMenu_Freeze_TogglesObservableHeaderState", async () => {
  const tableView = renderTableView();

  let menu = await openHeader(tableView, "Name");
  await tableView.user.click(
    within(menu).getByRole("menuitem", { name: "Freeze up to column" }),
  );
  menu = await reopenHeader(tableView, "Name");
  expect(
    within(menu).getByRole("menuitem", { name: "Unfreeze columns" }),
  ).toBeVisible();
});

it("PropMenu_Group_TogglesGroupedRowsAndHeaderAction", async () => {
  const tableView = renderTableView();

  let menu = await openHeader(tableView, "Name");
  await tableView.user.click(
    within(menu).getByRole("menuitem", { name: "Group" }),
  );
  await waitFor(() => {
    expect(screen.getAllByRole("group", { name: /^Group / })).not.toHaveLength(
      0,
    );
  });
  menu = await reopenHeader(tableView, "Name");
  expect(within(menu).getByRole("menuitem", { name: "Ungroup" })).toBeVisible();
  await tableView.user.click(
    within(menu).getByRole("menuitem", { name: "Ungroup" }),
  );
  await waitFor(() =>
    expect(screen.queryAllByRole("group", { name: /^Group / })).toHaveLength(0),
  );
});

it("PropMenu_Duplicate_ReportsExactPropertyAction", async () => {
  const onPropertiesChange = vi.fn();
  const tableView = renderTableView({ onPropertiesChange });

  const menu = await openHeader(tableView, "Name");
  await tableView.user.click(
    within(menu).getByRole("menuitem", { name: "Duplicate property" }),
  );
  expect(onPropertiesChange).toHaveBeenLastCalledWith(
    expect.objectContaining({
      action: expect.objectContaining({ type: "properties.duplicate" }),
    }),
  );
});

it("PropMenu_Hide_UpdatesVisibilityAndCanBeRestored", async () => {
  const onPropertiesChange = vi.fn();
  const tableView = renderTableView({ onPropertiesChange });

  const menu = await openHeader(tableView, "Name");
  await tableView.user.click(
    within(menu).getByRole("menuitem", { name: "Hide in view" }),
  );
  expect(onPropertiesChange).toHaveBeenLastCalledWith(
    expect.objectContaining({
      action: expect.objectContaining({ type: "properties.visibility.change" }),
    }),
  );
  expect(
    screen.queryByRole("button", { name: "Name" }),
  ).not.toBeInTheDocument();

  const settings = screen.getByRole("button", { name: "Settings" });
  await tableView.user.click(settings);
  await tableView.user.click(
    await screen.findByRole("menuitem", { name: "Edit properties" }),
  );
  const propertiesMenu = await findMenuByHeading("Properties");
  await tableView.user.click(
    within(propertiesMenu).getByRole("button", {
      name: "Toggle Name visibility",
    }),
  );
  expect(screen.getByRole("button", { name: "Name" })).toBeVisible();
});

it("PropMenu_Delete_ReportsExactPropertyAction", async () => {
  const onPropertiesChange = vi.fn();
  const tableView = renderTableView({ onPropertiesChange });

  const menu = await openHeader(tableView, "Name");
  await tableView.user.click(
    within(menu).getByRole("menuitem", { name: "Delete property" }),
  );
  expect(onPropertiesChange).toHaveBeenLastCalledWith(
    expect.objectContaining({
      action: expect.objectContaining({ type: "properties.delete" }),
    }),
  );
});

it("PropMenu_InsertRight_CreatesAtRequestedBoundary", async () => {
  const onPropertiesChange = vi.fn();
  const tableView = renderTableView({ onPropertiesChange });

  const menu = await openHeader(tableView, "Name");
  await tableView.user.click(
    within(menu).getByRole("menuitem", { name: "Insert right" }),
  );
  const create = await findMenuByHeading("New property");
  await tableView.user.click(
    within(create).getByRole("option", { name: "Number" }),
  );
  expect(onPropertiesChange.mock.calls.at(-1)?.[0].action).toMatchObject({
    type: "properties.create",
    payload: { nextPosition: 1 },
  });
});

it("PropMenu_TitleColumn_HidesDestructiveTypeActions", async () => {
  const properties = [
    { ...mockProperties[0]!, type: "title", config: { showIcon: true } },
    mockProperties[1]!,
  ];
  const data = mockData.map<Row>((row) => ({
    ...row,
    properties: { ...row.properties },
  }));
  const tableView = renderTableView({ properties, data });
  const menu = await openHeader(tableView, "Name");

  expect(
    within(menu).queryByRole("menuitem", { name: "Change type" }),
  ).not.toBeInTheDocument();
  expect(
    within(menu).queryByRole("menuitem", { name: "Hide in view" }),
  ).not.toBeInTheDocument();
  expect(
    within(menu).queryByRole("menuitem", { name: "Duplicate property" }),
  ).not.toBeInTheDocument();
  expect(
    within(menu).queryByRole("menuitem", { name: "Delete property" }),
  ).not.toBeInTheDocument();
});
