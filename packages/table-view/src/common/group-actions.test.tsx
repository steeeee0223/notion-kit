import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "@/__tests__/mock";

mockResizeObserver();

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
  const { group } = await renderGroupedTable();
  await openGroupOptions(group);
  const initial = screen.getByRole("menuitem", { name: /aggregation/ });
  const initialName = initial.textContent;

  fireEvent.click(initial);
  await openGroupOptions(group);

  expect(
    screen.getByRole("menuitem", { name: /aggregation/ }),
  ).not.toHaveTextContent(initialName!);
});

it("GroupActions_AddRow_CreatesResourceInsideGroup", async () => {
  const { group, onDataChange } = await renderGroupedTable();

  fireEvent.click(within(group).getByRole("button", { name: "Add row" }));

  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  expect(onDataChange.mock.calls[0]?.[0].action).toMatchObject({
    type: "data.row.create",
  });
});

it("GroupActions_HideGroup_RemovesSelectedGroupFromView", async () => {
  const { group } = await renderGroupedTable();
  const initialGroupCount = screen.getAllByRole("group", {
    name: /^Group /,
  }).length;
  await openGroupOptions(group);

  fireEvent.click(screen.getByRole("menuitem", { name: "Hide group" }));

  await waitFor(() =>
    expect(screen.getAllByRole("group", { name: /^Group / })).toHaveLength(
      initialGroupCount - 1,
    ),
  );
});

it("GroupActions_DeleteRows_ConfirmsAndRemovesEveryChild", async () => {
  const { tableView, group, onDataChange } = await renderGroupedTable();
  await openGroupOptions(group);
  fireEvent.click(screen.getByRole("menuitem", { name: "Delete rows" }));

  const dialog = await screen.findByRole("dialog", {
    name: "Are you sure? All rows inside this group will be deleted.",
  });
  await tableView.user.click(
    within(dialog).getByRole("button", { name: "Delete" }),
  );

  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  expect(onDataChange.mock.calls[0]?.[0].action).toMatchObject({
    type: "data.row.delete",
    payload: { rowIds: expect.any(Array) },
  });
  expect(
    onDataChange.mock.calls[0]?.[0].action.payload.rowIds.length,
  ).toBeGreaterThan(0);
});
