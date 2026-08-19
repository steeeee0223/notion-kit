import { useEffect } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import type {
  DataResourceAction,
  ResourceChange,
  Row,
} from "@notion-kit/table-hook";

import { createFullPluginFixture, mockResizeObserver } from "@/__tests__/mock";
import { TableViewWrapper, useTableViewCtx } from "@/table-contexts";

import { renderTableView } from "../../__tests__/component-objects/render-table-view";
import { BulkEditBar } from "./bulk-edit-bar";

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

it.each([
  {
    name: "all false",
    values: [false, false],
    initial: "false",
    final: "true",
  },
  { name: "all true", values: [true, true], initial: "true", final: "false" },
  { name: "mixed", values: [true, false], initial: "mixed", final: "true" },
])(
  "BulkEditBar_CheckboxSelection_$name_ExposesItsAccessibleStateAndPersistsOneFinalValue",
  async ({ values, initial, final }) => {
    const fixture = createFullPluginFixture();
    const alpha = fixture.data.find((row) => row.id === "row-alpha");
    const empty = fixture.data.find((row) => row.id === "row-empty");
    if (!alpha || !empty) throw new Error("checkbox fixture rows are required");
    alpha.properties.complete!.value = values[0]!;
    empty.properties.complete!.value = values[1]!;

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
    expect(checkbox).toHaveAttribute("aria-checked", initial);

    await table.user.click(checkbox);

    await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
    expect(checkbox).toHaveAttribute("aria-checked", final);
    expect(onDataChange.mock.calls[0]![0].action).toMatchObject({
      type: "data.cell.update",
      payload: {
        rowIds: ["row-alpha", "row-empty"],
        propertyId: "complete",
      },
    });
  },
);

it("BulkEditBar_DisabledHost_ForwardsDisabledStateToTheSharedCheckboxEditor", async () => {
  const fixture = createFullPluginFixture();
  const onDataChange = vi.fn<(change: DataChange) => void>();
  const user = userEvent.setup();
  render(
    <TableViewWrapper
      data={fixture.data}
      properties={fixture.properties}
      view={fixture.view}
      onDataChange={onDataChange}
    >
      <BulkEditBar disabled />
      <SelectRows rowIds={["row-alpha", "row-empty"]} />
    </TableViewWrapper>,
  );

  const bar = await screen.findByTestId("bulk-edit-bar");
  const checkbox = within(bar).getByRole("checkbox");
  expect(checkbox).toHaveAttribute("aria-disabled", "true");

  await user.click(checkbox);

  expect(onDataChange).not.toHaveBeenCalled();
});
