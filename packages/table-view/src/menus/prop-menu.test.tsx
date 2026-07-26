import { screen, waitFor, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import type { ColumnInfo, Row } from "@notion-kit/table-hook";

import {
  findMenuByHeading,
  findMenuByItem,
} from "@/__tests__/component-objects/menu-surface";
import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import type { TableViewObject } from "@/__tests__/component-objects/table-view";
import { mockData, mockProperties, mockResizeObserver } from "@/__tests__/mock";

mockResizeObserver();

const anyString: unknown = expect.any(String);

interface CapturedResourceChange<TNext = unknown[]> {
  action: { id: unknown; payload: Record<string, unknown> };
  next: TNext;
}

function lastResourceChange<TNext = unknown[]>(callback: {
  mock: { lastCall: unknown[] | undefined };
}) {
  return callback.mock.lastCall?.[0] as
    | CapturedResourceChange<TNext>
    | undefined;
}

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
  // Arrange
  const onPropertiesChange = vi.fn();
  const tableView = renderTableView({ onPropertiesChange });

  let menu = await openHeader(tableView, "Name");

  // Act
  await tableView.user.click(
    within(menu).getByRole("menuitem", { name: "Wrap text" }),
  );

  // Assert
  expect(lastResourceChange(onPropertiesChange)?.action).toEqual({
    id: anyString,
    type: "properties.update",
    payload: {
      propertyId: "col1",
      previous: mockProperties[0],
      next: { ...mockProperties[0], wrapped: true },
    },
  });
  menu = await reopenHeader(tableView, "Name");
  expect(
    within(menu).getByRole("menuitem", { name: "Unwrap text" }),
  ).toBeVisible();
});

it("PropMenu_Rename_UpdatesHeaderAndReportsPropertyChange", async () => {
  // Arrange
  const onPropertiesChange = vi.fn();
  const tableView = renderTableView({ onPropertiesChange });
  const menu = await openHeader(tableView, "Name");
  const name = within(menu).getByDisplayValue("Name");

  // Act
  await tableView.user.clear(name);
  await tableView.user.type(name, "Owner");
  await tableView.user.tab();

  // Assert
  expect(screen.getByRole("button", { name: "Owner" })).toBeVisible();
  expect(lastResourceChange(onPropertiesChange)?.action).toEqual({
    id: anyString,
    type: "properties.update",
    payload: {
      propertyId: "col1",
      previous: mockProperties[0],
      next: { ...mockProperties[0], name: "Owner" },
    },
  });
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
  // Arrange
  const onPropertiesChange = vi.fn();
  const tableView = renderTableView({ onPropertiesChange });
  const menu = await openHeader(tableView, "Name");

  // Act
  await tableView.user.click(
    menu.querySelector<HTMLElement>('[aria-label="Add property description"]')!,
  );
  const description = within(menu).getByPlaceholderText("Add a description...");
  await tableView.user.type(description, "Primary task name");
  await tableView.user.tab();

  // Assert
  expect(lastResourceChange(onPropertiesChange)?.action).toEqual({
    id: anyString,
    type: "properties.update",
    payload: {
      propertyId: "col1",
      previous: mockProperties[0],
      next: { ...mockProperties[0], description: "Primary task name" },
    },
  });
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
  // Arrange
  const onPropertiesChange = vi.fn();
  const tableView = renderTableView({ onPropertiesChange });

  const menu = await openHeader(tableView, "Name");

  // Act
  await tableView.user.click(
    within(menu).getByRole("menuitem", { name: "Duplicate property" }),
  );

  // Assert
  const change = lastResourceChange<ColumnInfo[]>(onPropertiesChange);
  const action = change?.action;
  const duplicatedProperty = change?.next[1];
  expect(action?.payload.propertyId).toEqual(anyString);
  expect(duplicatedProperty?.id).toEqual(anyString);
  expect(action?.payload.propertyId).toBe(duplicatedProperty?.id);
  expect(action).toEqual({
    id: anyString,
    type: "properties.duplicate",
    payload: {
      sourcePropertyId: "col1",
      propertyId: duplicatedProperty?.id,
      nextPosition: 1,
    },
  });
  expect(duplicatedProperty).toEqual({
    ...mockProperties[0],
    id: anyString,
    name: "Name 1",
  });
  expect(screen.getByRole("button", { name: "Name 1" })).toBeVisible();
});

it("PropMenu_Hide_UpdatesVisibilityAndCanBeRestored", async () => {
  // Arrange
  const onPropertiesChange = vi.fn();
  const tableView = renderTableView({ onPropertiesChange });

  const menu = await openHeader(tableView, "Name");

  // Act
  await tableView.user.click(
    within(menu).getByRole("menuitem", { name: "Hide in view" }),
  );

  // Assert
  expect(lastResourceChange(onPropertiesChange)?.action).toEqual({
    id: anyString,
    type: "properties.visibility.change",
    payload: {
      propertyIds: ["col1"],
      previousHidden: { col1: false },
      nextHidden: { col1: true },
    },
  });
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
  // Arrange
  const onPropertiesChange = vi.fn();
  const tableView = renderTableView({ onPropertiesChange });

  const menu = await openHeader(tableView, "Name");

  // Act
  await tableView.user.click(
    within(menu).getByRole("menuitem", { name: "Delete property" }),
  );

  // Assert
  expect(lastResourceChange(onPropertiesChange)?.action).toEqual({
    id: anyString,
    type: "properties.delete",
    payload: { propertyId: "col1", previousPosition: 0 },
  });
});

it.each([
  ["Left", "left", 0],
  ["Right", "right", 1],
] as const)(
  "PropMenu_Insert%s_CreatesAtRequestedBoundary",
  async (_label, side, nextPosition) => {
    // Arrange
    const onPropertiesChange = vi.fn();
    const tableView = renderTableView({ onPropertiesChange });
    const menu = await openHeader(tableView, "Name");

    // Act
    await tableView.user.click(
      within(menu).getByRole("menuitem", { name: `Insert ${side}` }),
    );
    const create = await findMenuByHeading("New property");
    await tableView.user.click(
      within(create).getByRole("option", { name: "Number" }),
    );

    // Assert
    const change = lastResourceChange<ColumnInfo[]>(onPropertiesChange);
    const action = change?.action;
    const createdProperty = change?.next[nextPosition];
    expect(action?.payload.propertyId).toEqual(anyString);
    expect(createdProperty?.id).toEqual(anyString);
    expect(action?.payload.propertyId).toBe(createdProperty?.id);
    expect(action).toEqual({
      id: anyString,
      type: "properties.create",
      payload: {
        propertyId: createdProperty?.id,
        nextPosition,
        property: {
          id: createdProperty?.id,
          name: "Number",
          type: "number",
          config: {
            format: "number",
            round: "default",
            showAs: "number",
            options: { color: "green", divideBy: 100, showNumber: true },
          },
        },
      },
    });
    expect(createdProperty).toEqual({
      id: anyString,
      name: "Number",
      type: "number",
      config: {
        format: "number",
        round: "default",
        showAs: "number",
        options: { color: "green", divideBy: 100, showNumber: true },
      },
    });
    expect(screen.getByRole("button", { name: "Number" })).toBeVisible();
  },
);

it("PropertyMenu_ChangeType_ReportsExactTypeAndCellBoundary", async () => {
  // Arrange
  const onDataChange = vi.fn();
  const onPropertiesChange = vi.fn();
  const tableView = renderTableView({ onDataChange, onPropertiesChange });
  const settings = await tableView.openViewSettings();
  const properties = await settings.openProperties();
  await tableView.user.click(properties.property("Name"));
  const edit = await findMenuByHeading("Edit property");

  // Act
  await tableView.user.click(
    within(edit).getByRole("menuitem", { name: "Type" }),
  );
  const types = await findMenuByHeading("Change property type");
  await tableView.user.click(
    within(types).getByRole("option", { name: "Checkbox" }),
  );

  // Assert
  const propertiesChange = lastResourceChange(onPropertiesChange);
  const dataChange = lastResourceChange(onDataChange);
  expect(propertiesChange?.action).toEqual({
    id: anyString,
    type: "properties.type.change",
    payload: {
      propertyId: "col1",
      previousType: "text",
      nextType: "checkbox",
    },
  });
  expect(dataChange?.action).toEqual({
    id: propertiesChange?.action.id,
    type: "data.cell.update",
    payload: { rowIds: ["row1", "row2", "row3"], propertyId: "col1" },
  });
});

it("PropMenu_TitleConfigToggle_ReportsExactPropertyPayload", async () => {
  // Arrange
  const titleProperty = {
    ...mockProperties[0]!,
    type: "title" as const,
    config: { showIcon: true },
  };
  const onPropertiesChange = vi.fn();
  const tableView = renderTableView({
    properties: [titleProperty, mockProperties[1]!],
    onPropertiesChange,
  });
  const menu = await openHeader(tableView, "Name");

  // Act
  await tableView.user.click(
    within(menu).getByRole("switch", { name: "Show page icon" }),
  );

  // Assert
  expect(lastResourceChange(onPropertiesChange)?.action).toEqual({
    id: anyString,
    type: "properties.update",
    payload: {
      propertyId: "col1",
      previous: titleProperty,
      next: { ...titleProperty, config: { showIcon: false } },
    },
  });
});

it("PropMenu_LockedView_DisablesHeaderMutationBoundary", async () => {
  // Arrange
  const onPropertiesChange = vi.fn();
  const tableView = renderTableView({
    view: { locked: true },
    onPropertiesChange,
  });
  const header = screen.getByRole("button", { name: "Name" });

  // Act
  await tableView.user.click(header);

  // Assert
  expect(header).toBeDisabled();
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  expect(onPropertiesChange).not.toHaveBeenCalled();
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
