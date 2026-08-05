import { useEffect } from "react";
import { screen, within } from "@testing-library/react";
import { expect, it } from "vitest";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { mockData, mockProperties, mockResizeObserver } from "@/__tests__/mock";
import { useTableViewCtx } from "@/table-contexts";

mockResizeObserver();

const titleProperties = [
  {
    ...mockProperties[0]!,
    type: "title" as const,
    config: { showIcon: true },
  },
  mockProperties[1]!,
];

function rowCheckbox(rowId: string) {
  return screen.getByRole("checkbox", { name: `Select row ${rowId}` });
}

function headerCheckbox() {
  return screen.getByRole("checkbox", { name: "Select all rows" });
}

function GroupingSetup({ nested = false }: { nested?: boolean }) {
  const { table } = useTableViewCtx();

  useEffect(() => {
    table.setGrouping(nested ? ["col2", "col1"] : ["col2"]);
  }, [nested, table]);

  return null;
}

function renderGroupedTable(nested = false) {
  return renderTableView({
    properties: titleProperties,
    children: <GroupingSetup nested={nested} />,
  });
}

async function groupCheckbox(groupId: string) {
  return screen.findByRole("checkbox", { name: `Select group ${groupId}` });
}

it("TableRowSelection_RowCheckboxClick_TogglesSelectedState", async () => {
  const tableView = renderTableView({ properties: titleProperties });

  const checkbox = rowCheckbox("row1");
  expect(checkbox).toHaveAttribute("aria-checked", "false");

  await tableView.user.click(checkbox);

  expect(checkbox).toHaveAttribute("aria-checked", "true");
});

it("TableRowSelection_ShiftClick_SelectsInclusiveDisplayedRange", async () => {
  const tableView = renderTableView({ properties: titleProperties });

  await tableView.user.click(rowCheckbox("row1"));
  await tableView.user.keyboard("[ShiftLeft>]");
  await tableView.user.click(rowCheckbox("row3"));
  await tableView.user.keyboard("[/ShiftLeft]");

  expect(rowCheckbox("row1")).toHaveAttribute("aria-checked", "true");
  expect(rowCheckbox("row2")).toHaveAttribute("aria-checked", "true");
  expect(rowCheckbox("row3")).toHaveAttribute("aria-checked", "true");
});

it("TableHeaderSelection_NoRowsSelected_RendersUnchecked", () => {
  renderTableView({ data: [], properties: titleProperties });

  expect(headerCheckbox()).toHaveAttribute("aria-checked", "false");
});

it("TableHeaderSelection_SomeRowsSelected_RendersIndeterminate", async () => {
  const tableView = renderTableView({ properties: titleProperties });

  await tableView.user.click(rowCheckbox("row1"));

  expect(headerCheckbox()).toHaveAttribute("aria-checked", "mixed");
});

it("TableHeaderSelection_AllRowsSelected_RendersChecked", async () => {
  const tableView = renderTableView({ properties: titleProperties });

  await tableView.user.click(headerCheckbox());

  expect(headerCheckbox()).toHaveAttribute("aria-checked", "true");
});

it("TableHeaderSelection_Toggle_SelectsAndClearsAllRows", async () => {
  const tableView = renderTableView({ properties: titleProperties });

  await tableView.user.click(headerCheckbox());
  expect(rowCheckbox("row1")).toHaveAttribute("aria-checked", "true");
  expect(rowCheckbox("row2")).toHaveAttribute("aria-checked", "true");
  expect(rowCheckbox("row3")).toHaveAttribute("aria-checked", "true");

  await tableView.user.click(headerCheckbox());
  expect(rowCheckbox("row1")).toHaveAttribute("aria-checked", "false");
  expect(rowCheckbox("row2")).toHaveAttribute("aria-checked", "false");
  expect(rowCheckbox("row3")).toHaveAttribute("aria-checked", "false");
});

it("TableGroupSelection_SomeDescendantsSelected_RendersIndeterminate", async () => {
  const tableView = renderGroupedTable();
  const group = await screen.findByRole("group", { name: "Group col2:true" });

  await tableView.user.click(within(group).getByRole("button", { name: "Open" }));
  await tableView.user.click(rowCheckbox("row1"));

  expect(await groupCheckbox("col2:true")).toHaveAttribute(
    "aria-checked",
    "mixed",
  );
});

it("TableGroupSelection_CollapsedGroupToggle_SelectsAllDescendantLeaves", async () => {
  const tableView = renderGroupedTable();
  const group = await screen.findByRole("group", { name: "Group col2:true" });

  await tableView.user.click(await groupCheckbox("col2:true"));
  await tableView.user.click(within(group).getByRole("button", { name: "Open" }));

  expect(rowCheckbox("row1")).toHaveAttribute("aria-checked", "true");
  expect(rowCheckbox("row3")).toHaveAttribute("aria-checked", "true");
});

it("TableGroupSelection_NestedGroups_UsesAllDescendantLeaves", async () => {
  const tableView = renderGroupedTable(true);

  await tableView.user.click(await groupCheckbox("col2:true"));

  expect(await groupCheckbox("col2:true")).toHaveAttribute(
    "aria-checked",
    "true",
  );

  await tableView.user.click(await groupCheckbox("col2:true"));

  expect(await groupCheckbox("col2:true")).toHaveAttribute(
    "aria-checked",
    "false",
  );
});
