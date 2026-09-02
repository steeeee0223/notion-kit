import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import type { ColumnInfo, Row, TableViewState } from "@notion-kit/table-hook";
import type { CellPlugin } from "@notion-kit/table-hook/plugins";

import { MenuSurfaceObject } from "@/__tests__/component-objects/menu-surface";
import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import type { TableViewObject } from "@/__tests__/component-objects/table-view";
import {
  createTestUiPlugin,
  extendDefaultPlugins,
  mockData,
  mockProperties,
  mockResizeObserver,
} from "@/__tests__/mock";

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
  return MenuSurfaceObject.findByItem(tableView.user, "Calculate");
}

async function reopenHeader(tableView: TableViewObject, name: string) {
  return openHeader(tableView, name);
}

it("PropMenu_Filter_AppendsARootRuleAndOpensTheSharedFilterEditor", async () => {
  const onViewChange = vi.fn();
  const tableView = renderTableView({
    onViewChange,
    view: {
      filters: {
        kind: "group",
        id: "root-filter",
        logic: "and",
        children: [
          {
            kind: "rule",
            id: "done-filter",
            propertyId: "col2",
            operator: "equals",
          },
        ],
      },
    },
  });
  const menu = await openHeader(tableView, "Name");

  await tableView.user.click(menu.item("Filter"));

  await waitFor(() => expect(menu.root).not.toBeInTheDocument());
  expect(screen.getByRole("dialog", { name: "Filters" })).toBeVisible();
  expect(
    lastResourceChange<TableViewState>(onViewChange)?.next.filters,
  ).toMatchObject({
    kind: "group",
    id: "root-filter",
    logic: "and",
    children: [
      {
        kind: "rule",
        id: "done-filter",
        propertyId: "col2",
        operator: "equals",
      },
      {
        kind: "rule",
        propertyId: "col1",
        operator: "equals",
      },
    ],
  });
});

it("PropMenu_Wrap_TogglesObservableHeaderState", async () => {
  // Arrange
  const onPropertiesChange = vi.fn();
  const tableView = renderTableView({ onPropertiesChange });

  let menu = await openHeader(tableView, "Name");

  // Act
  await tableView.user.click(menu.item("Wrap text"));

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
  expect(menu.item("Unwrap text")).toBeVisible();
});

it("PropMenu_Rename_UpdatesHeaderAndReportsPropertyChange", async () => {
  // Arrange
  const onPropertiesChange = vi.fn();
  const tableView = renderTableView({ onPropertiesChange });
  const menu = await openHeader(tableView, "Name");
  const name = within(menu.root).getByDisplayValue("Name");

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
  const name = within(menu.root).getByDisplayValue("Name");

  await tableView.user.clear(name);
  await tableView.user.type(name, "Done");
  await tableView.user.tab();

  expect(menu.text(/A property named Done already exists/)).toBeVisible();
  expect(screen.getByRole("button", { name: "Name" })).toBeVisible();
});

it("PropMenu_DescriptionToggle_UpdatesPropertyMetadata", async () => {
  // Arrange
  const onPropertiesChange = vi.fn();
  const tableView = renderTableView({ onPropertiesChange });
  const menu = await openHeader(tableView, "Name");

  // Act
  await tableView.user.click(
    menu.root.querySelector<HTMLElement>(
      '[aria-label="Add property description"]',
    )!,
  );
  const description = within(menu.root).getByPlaceholderText(
    "Add a description...",
  );
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
  await tableView.user.click(menu.item("Freeze up to column"));
  menu = await reopenHeader(tableView, "Name");
  expect(menu.item("Unfreeze columns")).toBeVisible();
});

it("PropMenu_Group_TogglesGroupedRowsAndHeaderAction", async () => {
  const tableView = renderTableView();

  let menu = await openHeader(tableView, "Name");
  await tableView.user.click(menu.item("Group"));
  await waitFor(() => {
    expect(screen.getAllByRole("group", { name: /^Group / })).not.toHaveLength(
      0,
    );
  });
  menu = await reopenHeader(tableView, "Name");
  expect(menu.item("Ungroup")).toBeVisible();
  await tableView.user.click(menu.item("Ungroup"));
  await waitFor(() =>
    expect(screen.queryAllByRole("group", { name: /^Group / })).toHaveLength(0),
  );
});

it("PropMenu_QuickSortUsesPluginLabelsDefaultMethodAndInlineRuntime", async () => {
  const onViewChange = vi.fn();
  const plugin: CellPlugin<"rank-code", string, undefined> = {
    id: "rank-code",
    default: { config: undefined, data: "" },
    fromValue: (value) => String(value ?? ""),
    toValue: (value) => value,
    toTextValue: (value) => value,
    isEmpty: (value) => value.trim() === "",
    sorting: {
      defaultMethod: "length",
      methods: [
        {
          id: "alphabetical",
          name: "Alphabetical",
          ascendingLabel: "A first",
          descendingLabel: "Z first",
          function: () => 0,
        },
        {
          id: "length",
          name: "Length",
          ascendingLabel: "Short first",
          descendingLabel: "Long first",
          function: (rowA, rowB, colId) =>
            String(rowA.properties[colId]?.value ?? "").length -
            String(rowB.properties[colId]?.value ?? "").length,
        },
      ],
    },
  };
  const tableView = renderTableView({
    plugins: extendDefaultPlugins([plugin], [createTestUiPlugin(plugin)]),
    properties: [
      { id: "name", name: "Name", type: "title", config: { showIcon: true } },
      { id: "rank", name: "Rank", type: "rank-code" },
    ],
    data: [
      customRow("one", "One", "bbb"),
      customRow("two", "Two", "a"),
      customRow("three", "Three", "cc"),
    ],
    onViewChange,
  });
  const menu = await openHeader(tableView, "Rank");
  await tableView.user.hover(menu.item("Sort"));

  expect(
    await screen.findByRole("menuitem", { name: "Short first" }),
  ).toBeVisible();
  expect(screen.getByRole("menuitem", { name: "Long first" })).toBeVisible();
  fireEvent.click(screen.getByRole("menuitem", { name: "Short first" }));

  await waitFor(() =>
    expect(tableView.rowOrder(["One", "Two", "Three"])).toEqual([
      "Two",
      "Three",
      "One",
    ]),
  );
  const viewChange = onViewChange.mock.lastCall?.[0] as
    | { next: TableViewState }
    | undefined;
  expect(viewChange?.next.pluginMethods).toMatchObject({
    sortingMethodByColumn: { rank: "length" },
  });
});

function customRow(id: string, name: string, rank: string): Row {
  return {
    id,
    createdAt: 0,
    lastEditedAt: 0,
    properties: {
      name: { id: `${id}-name`, value: name },
      rank: { id: `${id}-rank`, value: rank },
    },
  };
}

it("PropMenu_Duplicate_ReportsExactPropertyAction", async () => {
  // Arrange
  const onPropertiesChange = vi.fn();
  const tableView = renderTableView({ onPropertiesChange });

  const menu = await openHeader(tableView, "Name");

  // Act
  await tableView.user.click(menu.item("Duplicate property"));

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
  await tableView.user.click(menu.item("Hide in view"));

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
  const propertiesMenu = await MenuSurfaceObject.findByHeading(
    tableView.user,
    "Properties",
  );
  await tableView.user.click(propertiesMenu.button("Toggle Name visibility"));
  expect(screen.getByRole("button", { name: "Name" })).toBeVisible();
});

it("PropMenu_Delete_ReportsExactPropertyAction", async () => {
  // Arrange
  const onPropertiesChange = vi.fn();
  const tableView = renderTableView({ onPropertiesChange });

  const menu = await openHeader(tableView, "Name");

  // Act
  await tableView.user.click(menu.item("Delete property"));

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
    await tableView.user.click(menu.item(`Insert ${side}`));
    const create = await MenuSurfaceObject.findByHeading(
      tableView.user,
      "New property",
    );
    await tableView.user.click(create.option("Number"));

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
  const edit = await MenuSurfaceObject.findByHeading(
    tableView.user,
    "Edit property",
  );

  // Act
  await tableView.user.click(edit.item("Type"));
  const types = await MenuSurfaceObject.findByHeading(
    tableView.user,
    "Change property type",
  );
  await tableView.user.click(types.option("Checkbox"));

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
    within(menu.root).getByRole("switch", { name: "Show page icon" }),
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

  expect(menu.queryItem("Change type")).not.toBeInTheDocument();
  expect(menu.queryItem("Hide in view")).not.toBeInTheDocument();
  expect(menu.queryItem("Duplicate property")).not.toBeInTheDocument();
  expect(menu.queryItem("Delete property")).not.toBeInTheDocument();
});
