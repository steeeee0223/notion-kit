import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "@/__tests__/mock";

mockResizeObserver();

const anyString: unknown = expect.any(String);

function lastAction(callback: { mock: { lastCall: unknown[] | undefined } }) {
  return (
    callback.mock.lastCall?.[0] as
      | { action: { id: unknown; payload: Record<string, unknown> } }
      | undefined
  )?.action;
}

async function renderGroupedTable(onDataChange = vi.fn()) {
  const tableView = renderTableView({ onDataChange });
  const settings = await tableView.openViewSettings();
  const grouping = await settings.openSelectGrouping();
  await grouping.select("Done");
  await tableView.clickOutside();
  const group = screen.getAllByRole("group", { name: /^Group / })[0]!;
  return { tableView, group, onDataChange };
}

async function openGroupOptions(group: HTMLElement) {
  fireEvent.click(within(group).getByRole("button", { name: "Group options" }));
  await screen.findByRole("menuitem", { name: /aggregation/ });
}

it("GroupActions_AggregationToggle_ChangesAvailableAction", async () => {
  // Arrange
  const { group } = await renderGroupedTable();
  await openGroupOptions(group);
  const initial = screen.getByRole("menuitem", { name: /aggregation/ });
  const initialName = initial.textContent;

  // Act
  fireEvent.click(initial);
  await openGroupOptions(group);

  // Assert
  expect(
    screen.getByRole("menuitem", { name: /aggregation/ }),
  ).not.toHaveTextContent(initialName);
});

it("GroupActions_AddRow_CreatesExactResourceInsideSelectedGroup", async () => {
  // Arrange
  const { group, onDataChange } = await renderGroupedTable();
  const groupId = group.getAttribute("aria-label")?.replace("Group ", "");

  // Act
  fireEvent.click(within(group).getByRole("button", { name: "Add row" }));

  // Assert
  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  const action = lastAction(onDataChange);
  expect(action).toEqual({
    id: anyString,
    type: "data.row.create",
    payload: {
      rowId: anyString,
      nextPosition: 3,
      groupId,
    },
  });
});

it("GroupActions_HideGroup_RemovesSelectedGroupFromView", async () => {
  // Arrange
  const { group } = await renderGroupedTable();
  const initialGroupCount = screen.getAllByRole("group", {
    name: /^Group /,
  }).length;
  await openGroupOptions(group);

  // Act
  fireEvent.click(screen.getByRole("menuitem", { name: "Hide group" }));

  // Assert
  await waitFor(() =>
    expect(screen.getAllByRole("group", { name: /^Group / })).toHaveLength(
      initialGroupCount - 1,
    ),
  );
});

it("GroupActions_DeleteRows_ConfirmsAndRemovesExactChildResources", async () => {
  // Arrange
  const { tableView, group, onDataChange } = await renderGroupedTable();
  await openGroupOptions(group);

  // Act
  fireEvent.click(screen.getByRole("menuitem", { name: "Delete rows" }));

  const dialog = await screen.findByRole("dialog", {
    name: "Are you sure? All rows inside this group will be deleted.",
  });
  await tableView.user.click(
    within(dialog).getByRole("button", { name: "Delete" }),
  );

  // Assert
  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  expect(lastAction(onDataChange)).toEqual({
    id: anyString,
    type: "data.row.delete",
    payload: {
      rowIds: ["row1", "row3"],
      previousPositions: [
        { rowId: "row1", index: 0 },
        { rowId: "row3", index: 2 },
      ],
    },
  });
});

it("GroupActions_LockedView_HidesControlsWithoutDataMutation", async () => {
  // Arrange
  const onDataChange = vi.fn();
  const tableView = renderTableView({
    view: { locked: true },
    onDataChange,
  });
  const settings = await tableView.openViewSettings();

  // Act
  const grouping = await settings.openSelectGrouping();
  await grouping.select("Done");
  await tableView.clickOutside();

  // Assert
  const group = screen.getAllByRole("group", { name: /^Group / })[0]!;
  await waitFor(() => {
    expect(
      within(group).queryByRole("button", { name: "Group options" }),
    ).not.toBeInTheDocument();
    expect(
      within(group).queryByRole("button", { name: "Add row" }),
    ).not.toBeInTheDocument();
  });
  expect(onDataChange).not.toHaveBeenCalled();
});
