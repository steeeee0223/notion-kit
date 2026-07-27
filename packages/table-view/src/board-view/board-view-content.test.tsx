import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { expect, it } from "vitest";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import type { TableViewObject } from "@/__tests__/component-objects/table-view";
import {
  createFullPluginFixture,
  mockProperties,
  mockResizeObserver,
} from "@/__tests__/mock";

mockResizeObserver();

const titleProperties = [
  {
    ...mockProperties[0]!,
    type: "title",
    config: { showIcon: true },
  },
  mockProperties[1]!,
];

async function selectGroupedBoard(
  tableView: TableViewObject,
  propertyName = "Done",
) {
  const settings = await tableView.openViewSettings();
  const grouping = await settings.openSelectGrouping();
  await grouping.select(propertyName);
  await tableView.clickOutside();

  const groupedSettings = await tableView.openViewSettings();
  const layout = await groupedSettings.openLayout();
  await layout.selectLayout("Board");
  await tableView.clickOutside();
}

it.each(["Enter", " "])("BoardCard_%s_OpensConfiguredRowView", async (key) => {
  // Arrange
  const tableView = renderTableView({ properties: titleProperties });
  await selectGroupedBoard(tableView);
  const card = screen.getByRole("button", { name: /Task 1/ });

  // Act
  fireEvent.keyDown(card, { key });

  // Assert
  expect(await screen.findByRole("heading", { name: "Task 1" })).toBeVisible();
});

it("BoardCard_NestedControlKeyDown_DoesNotOpenRowView", async () => {
  // Arrange
  const tableView = renderTableView({ properties: titleProperties });
  await selectGroupedBoard(tableView);
  const editButton = screen.getAllByRole("button", { name: "Edit" })[0]!;

  // Act
  fireEvent.keyDown(editButton, { key: "Enter" });

  // Assert
  expect(screen.queryByRole("heading", { name: "Task 1" })).toBeNull();
});

it.each([
  ["Status", "status", 3],
  ["Complete", "complete", 2],
  ["Due", "due", 3],
] as const)(
  "Board_%sGrouping_RendersEveryTypedAndEmptyValueAcross%dGroups",
  async (propertyName, propertyId, expectedGroupCount) => {
    // Arrange
    const fixture = createFullPluginFixture();
    const properties = fixture.properties.filter(
      (property) => property.id === "title" || property.id === propertyId,
    );
    const tableView = renderTableView({
      data: fixture.data,
      properties,
    });

    // Act
    await selectGroupedBoard(tableView, propertyName);

    // Assert
    expect(screen.getAllByRole("group", { name: /^Group / })).toHaveLength(
      expectedGroupCount,
    );
    for (const title of ["Alpha", "Empty", "Omega"]) {
      expect(
        screen.getByRole("button", { name: new RegExp(title) }),
      ).toBeVisible();
    }
  },
);

it("Board_EmptyData_RendersNoColumnsOrCards", async () => {
  // Arrange
  const tableView = renderTableView({
    data: [],
    properties: titleProperties,
  });

  // Act
  await selectGroupedBoard(tableView);

  // Assert
  expect(
    document.querySelector('[data-slot="notion-board-view"]'),
  ).toBeInTheDocument();
  expect(screen.queryAllByRole("group", { name: /^Group / })).toHaveLength(0);
  expect(screen.queryByRole("button", { name: "New page" })).toBeNull();
});

it("BoardGroup_HideAggregation_RemovesCurrentCardCount", async () => {
  // Arrange
  const tableView = renderTableView({ properties: titleProperties });
  await selectGroupedBoard(tableView);
  const group = screen.getAllByRole("group", { name: /^Group / })[0]!;
  const cardCount = within(group).getAllByRole("button", {
    name: /Task /,
  }).length;
  const aggregation = within(group).getByRole("button", {
    name: String(cardCount),
  });
  fireEvent.click(within(group).getByRole("button", { name: "Group options" }));

  // Act
  fireEvent.click(
    await screen.findByRole("menuitem", { name: "Hide aggregation" }),
  );

  // Assert
  await waitFor(() => expect(aggregation).not.toBeInTheDocument());
});

it("BoardGroup_HideGroup_RemovesOnlySelectedColumn", async () => {
  // Arrange
  const tableView = renderTableView({ properties: titleProperties });
  await selectGroupedBoard(tableView);
  const groups = screen.getAllByRole("group", { name: /^Group / });
  const group = groups[0]!;
  const hiddenGroupName = group.getAttribute("aria-label");
  fireEvent.click(within(group).getByRole("button", { name: "Group options" }));

  // Act
  fireEvent.click(await screen.findByRole("menuitem", { name: "Hide group" }));

  // Assert
  await waitFor(() =>
    expect(screen.queryByRole("group", { name: hiddenGroupName! })).toBeNull(),
  );
  expect(screen.getAllByRole("group", { name: /^Group / })).toHaveLength(
    groups.length - 1,
  );
});
