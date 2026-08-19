import { useEffect } from "react";
import { screen, waitFor, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import type {
  DataResourceAction,
  ResourceChange,
  Row,
} from "@notion-kit/table-hook";

import { createFullPluginFixture, mockResizeObserver } from "@/__tests__/mock";
import { useTableViewCtx } from "@/table-contexts";

import { renderTableView } from "../../__tests__/component-objects/render-table-view";

mockResizeObserver();

type DataChange = ResourceChange<Row[], DataResourceAction>;

function SelectFirstRow() {
  const { table } = useTableViewCtx();

  useEffect(() => {
    table.setRowSelection({ "row-alpha": true });
  }, [table]);

  return null;
}

function SelectRows({ rowIds }: { rowIds: string[] }) {
  const { table } = useTableViewCtx();

  useEffect(() => {
    table.setRowSelection(
      Object.fromEntries(rowIds.map((rowId) => [rowId, true])),
    );
  }, [rowIds, table]);

  return null;
}

it.each(["table", "list", "timeline"] as const)(
  "BulkEditBar_%sLayout_SelectedRow_ShowsOnlyEligibleColumnControls",
  async (layout) => {
    const fixture = createFullPluginFixture();
    renderTableView({
      data: fixture.data,
      properties: fixture.properties,
      view: {
        ...fixture.view,
        layout,
        timeline: { range: "monthly", datePropertyId: "due" },
      },
      children: <SelectFirstRow />,
    });

    const bar = await screen.findByTestId("bulk-edit-bar");

    expect(within(bar).getByText("1 row selected")).toBeVisible();
    expect(within(bar).getByRole("button", { name: "Notes" })).toBeVisible();
    expect(
      within(bar).queryByRole("button", { name: "Name" }),
    ).not.toBeInTheDocument();
    expect(
      within(bar).queryByRole("button", { name: "Created" }),
    ).not.toBeInTheDocument();
    expect(
      within(bar).queryByRole("button", { name: "Edited" }),
    ).not.toBeInTheDocument();
    expect(
      within(bar).getByRole("button", { name: "Delete 1 row" }),
    ).toBeVisible();
    expect(
      within(bar).getByRole("button", { name: "More bulk actions" }),
    ).toBeVisible();
  },
);

it("BulkEditBar_BoardLayout_SelectedRow_DoesNotRender", () => {
  const fixture = createFullPluginFixture();
  const table = renderTableView({
    data: fixture.data,
    properties: fixture.properties,
    view: { ...fixture.view, layout: "board" },
    children: <SelectFirstRow />,
  });

  expect(screen.queryByTestId("bulk-edit-bar")).not.toBeInTheDocument();
});

it("BulkEditBar_TextEditor_AppliesTheResolvedValueToEverySelectedRow", async () => {
  const fixture = createFullPluginFixture();
  const onDataChange = vi.fn<(change: DataChange) => void>();
  const table = renderTableView({
    data: fixture.data,
    properties: fixture.properties,
    view: fixture.view,
    onDataChange,
    children: <SelectRows rowIds={["row-alpha", "row-empty"]} />,
  });

  const bar = await screen.findByTestId("bulk-edit-bar");
  await table.user.click(within(bar).getByRole("button", { name: "Notes" }));
  const input = await screen.findByRole("textbox");
  await table.user.type(input, "Shared note{Enter}");

  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  expect(onDataChange.mock.calls[0]![0].action).toMatchObject({
    type: "data.cell.update",
    payload: { rowIds: ["row-alpha", "row-empty"], propertyId: "notes" },
  });
});

it("BulkEditBar_CheckboxMixedSelection_UsesOneInlineToggleToSetEverySelectedRowChecked", async () => {
  const fixture = createFullPluginFixture();
  const onDataChange = vi.fn<(change: DataChange) => void>();
  const table = renderTableView({
    data: fixture.data,
    properties: fixture.properties,
    view: fixture.view,
    onDataChange,
    children: <SelectRows rowIds={["row-alpha", "row-empty"]} />,
  });

  const bar = await screen.findByTestId("bulk-edit-bar");
  const checkbox = within(bar).getByRole("checkbox");
  expect(checkbox).toHaveAttribute("data-indeterminate", "");

  await table.user.click(checkbox);

  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  expect(checkbox).toBeChecked();
  expect(onDataChange.mock.calls[0]![0].action).toMatchObject({
    type: "data.cell.update",
    payload: {
      rowIds: ["row-alpha", "row-empty"],
      propertyId: "complete",
    },
  });
});
