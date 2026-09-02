import { useEffect } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import type {
  DataResourceAction,
  ResourceChange,
  Row,
} from "@notion-kit/table-hook";
import type { CellPlugin } from "@notion-kit/table-hook/plugins";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import {
  createFullPluginFixture,
  extendDefaultPlugins,
  mockResizeObserver,
} from "@/__tests__/mock";
import type { TableUiPlugin } from "@/plugins";
import {
  createBulkEditorRenderer,
  createCellRenderer,
} from "@/plugins/renderers";
import { TableViewWrapper, useTableViewCtx } from "@/table-contexts";

import { BulkEditBar } from "./bulk-edit-bar";
import { BulkEditorPopover } from "./bulk-editor";

mockResizeObserver();

type DataChange = ResourceChange<Row[], DataResourceAction>;

function isPropertiesChange(value: unknown): value is {
  action: { type: string; payload: { propertyId: string } };
  next: { id: string; config?: unknown }[];
} {
  if (!value || typeof value !== "object") return false;
  const change = value as {
    action?: { type?: unknown; payload?: { propertyId?: unknown } };
    next?: unknown;
  };
  return (
    typeof change.action?.type === "string" &&
    typeof change.action.payload?.propertyId === "string" &&
    Array.isArray(change.next)
  );
}

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

function createTextLikePopoverPlugin(
  id: string,
  name: string,
  onCommit: (
    onChange: (value: string | ((previous: string) => string)) => void,
  ) => void,
): {
  data: CellPlugin<string, string, undefined>;
  ui: TableUiPlugin<CellPlugin<string, string, undefined>>;
} {
  const data: CellPlugin<string, string, undefined> = {
    id,
    default: { data: "draft", config: undefined },
    fromValue: (value) => value?.toString() ?? "",
    toValue: (data) => data,
    toTextValue: (data) => data,
    isEmpty: (data) => data.trim() === "",
  };
  const ui: TableUiPlugin<typeof data> = {
    id,
    meta: { name, desc: "", icon: null },
    default: { name, icon: null },
    renderCell: createCellRenderer(({ textValue }) => textValue),
    renderBulkEditor: createBulkEditorRenderer<typeof data>(
      ({ data, disabled, icon, label, onChange }) => (
        <BulkEditorPopover
          disabled={disabled}
          icon={icon}
          initialData={data}
          label={label}
          onChange={onChange}
        >
          {() => (
            <button type="button" onClick={() => onCommit(onChange)}>
              Commit {name}
            </button>
          )}
        </BulkEditorPopover>
      ),
    ),
    renderGroupingValue: () => null,
  };
  return { data, ui };
}

function addTextLikeColumn(
  fixture: ReturnType<typeof createFullPluginFixture>,
  id: string,
  name: string,
  values: Record<string, string>,
) {
  fixture.properties.push({ id, name, type: id, config: undefined } as never);
  for (const row of fixture.data) {
    row.properties[id] = { id: `${row.id}-${id}`, value: values[row.id] ?? "" };
  }
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
  renderTableView({
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

it("BulkEditBar_TextEditor_ClearingADraftCommitsAnEmptyValueToEverySelectedRow", async () => {
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
  await table.user.type(input, "{Enter}");

  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  const change = onDataChange.mock.calls[0]![0];
  expect(
    change.next.find((row) => row.id === "row-alpha")?.properties.notes?.value,
  ).toBe("");
  expect(
    change.next.find((row) => row.id === "row-empty")?.properties.notes?.value,
  ).toBe("");
});

it("BulkEditBar_SelectEditor_KeepItsCurrentDraftVisibleAfterAnUpdate", async () => {
  const fixture = createFullPluginFixture();
  const table = renderTableView({
    data: fixture.data,
    properties: fixture.properties,
    view: fixture.view,
    children: <SelectRows rowIds={["row-alpha", "row-empty"]} />,
  });

  const bar = await screen.findByTestId("bulk-edit-bar");
  await table.user.click(within(bar).getByRole("button", { name: "Status" }));
  const statusInput = await screen.findByRole("combobox");
  expect(statusInput).toHaveValue("");
  await table.user.click(screen.getByRole("option", { name: "Active" }));
  expect(statusInput.parentElement).toHaveTextContent("Active");
});

it("BulkEditBar_MultiSelectEditor_OpensWithAnEmptyArrayDraft", async () => {
  const fixture = createFullPluginFixture();
  const table = renderTableView({
    data: fixture.data,
    properties: fixture.properties,
    view: fixture.view,
    children: <SelectRows rowIds={["row-alpha", "row-empty"]} />,
  });

  const bar = await screen.findByTestId("bulk-edit-bar");
  await table.user.click(within(bar).getByRole("button", { name: "Tags" }));

  const input = await screen.findByRole("combobox");
  expect(input).toHaveValue("");
  await table.user.click(screen.getByRole("option", { name: "Frontend" }));
  expect(input.parentElement).toHaveTextContent("Frontend");
});

it("BulkEditBar_CustomPopoverEditor_IsDiscoveredAndResolvesItsFunctionalDraftInOneAtomicUpdate", async () => {
  const fixture = createFullPluginFixture();
  const custom = createTextLikePopoverPlugin("custom", "Custom", (onChange) =>
    onChange((draft) => `${draft}!`),
  );
  addTextLikeColumn(fixture, "custom", "Custom", {
    "row-alpha": "stored alpha",
    "row-empty": "stored empty",
  });
  const onDataChange = vi.fn<(change: DataChange) => void>();
  const table = renderTableView({
    ...fixture,
    plugins: extendDefaultPlugins([custom.data], [custom.ui]),
    onDataChange,
    children: <SelectRows rowIds={["row-alpha", "row-empty"]} />,
  });

  const bar = await screen.findByTestId("bulk-edit-bar");
  await table.user.click(within(bar).getByRole("button", { name: "Custom" }));
  await table.user.click(
    await screen.findByRole("button", { name: "Commit Custom" }),
  );

  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  const change = onDataChange.mock.calls[0]![0];
  expect(change.action).toMatchObject({
    type: "data.cell.update",
    payload: { rowIds: ["row-alpha", "row-empty"], propertyId: "custom" },
  });
  expect(
    change.next.find((row) => row.id === "row-alpha")?.properties.custom?.value,
  ).toBe("draft!");
  expect(
    change.next.find((row) => row.id === "row-empty")?.properties.custom?.value,
  ).toBe("draft!");
});

it("BulkEditBar_OnlyShowsCustomPluginsWithAnEnabledEditor", async () => {
  const fixture = createFullPluginFixture();
  const valueOnly = createTextLikePopoverPlugin(
    "value-only",
    "Value only",
    () => undefined,
  );
  const disabledEditor = createTextLikePopoverPlugin(
    "disabled-editor",
    "Disabled editor",
    () => undefined,
  );
  const editable = createTextLikePopoverPlugin(
    "editable",
    "Editable",
    () => undefined,
  );
  addTextLikeColumn(fixture, "value-only", "Value only", {});
  addTextLikeColumn(fixture, "disabled-editor", "Disabled editor", {});
  addTextLikeColumn(fixture, "editable", "Editable", {});
  renderTableView({
    ...fixture,
    plugins: extendDefaultPlugins(
      [valueOnly.data, disabledEditor.data, editable.data],
      [
        { ...valueOnly.ui, renderBulkEditor: undefined },
        { ...disabledEditor.ui, renderBulkEditor: undefined },
        editable.ui,
      ],
    ),
    children: <SelectFirstRow />,
  });

  const bar = await screen.findByTestId("bulk-edit-bar");
  expect(within(bar).getByRole("button", { name: "Editable" })).toBeVisible();
  expect(
    within(bar).queryByRole("button", { name: "Value only" }),
  ).not.toBeInTheDocument();
  expect(
    within(bar).queryByRole("button", { name: "Disabled editor" }),
  ).not.toBeInTheDocument();
});

it("BulkEditBar_TwoPopoverColumns_RouteTheVisiblePayloadAndMutationToTheLatestColumn", async () => {
  const fixture = createFullPluginFixture();
  const first = createTextLikePopoverPlugin("first", "First", (onChange) =>
    onChange("first value"),
  );
  const second = createTextLikePopoverPlugin("second", "Second", (onChange) =>
    onChange("second value"),
  );
  addTextLikeColumn(fixture, "first", "First", {});
  addTextLikeColumn(fixture, "second", "Second", {});
  const onDataChange = vi.fn<(change: DataChange) => void>();
  const table = renderTableView({
    ...fixture,
    plugins: extendDefaultPlugins(
      [first.data, second.data],
      [first.ui, second.ui],
    ),
    onDataChange,
    children: <SelectRows rowIds={["row-alpha", "row-empty"]} />,
  });

  const bar = await screen.findByTestId("bulk-edit-bar");
  await table.user.click(within(bar).getByRole("button", { name: "First" }));
  expect(
    await screen.findByRole("button", { name: "Commit First" }),
  ).toBeVisible();
  await table.user.click(within(bar).getByRole("button", { name: "Second" }));
  expect(
    await screen.findByRole("button", { name: "Commit Second" }),
  ).toBeVisible();
  expect(
    screen.queryByRole("button", { name: "Commit First" }),
  ).not.toBeInTheDocument();

  await table.user.click(screen.getByRole("button", { name: "Commit Second" }));

  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  expect(onDataChange.mock.calls[0]![0].action).toMatchObject({
    type: "data.cell.update",
    payload: { propertyId: "second", rowIds: ["row-alpha", "row-empty"] },
  });
});

it("BulkEditBar_CustomEditor_ForwardsConfigUpdatesThroughTheColumnResource", async () => {
  const fixture = createFullPluginFixture();
  const configurable: CellPlugin<"configurable", string, { mode: string }> = {
    id: "configurable",
    default: {
      data: "",
      config: { mode: "default" },
    },
    fromValue: (value) => value?.toString() ?? "",
    toValue: (data) => data,
    toTextValue: (data) => data,
    isEmpty: (data) => data.trim() === "",
  };
  const configurableUi: TableUiPlugin<typeof configurable> = {
    id: "configurable",
    meta: { name: "Configurable", desc: "", icon: null },
    default: { name: "Configurable", icon: null },
    renderCell: createCellRenderer(({ textValue }) => textValue),
    renderBulkEditor: createBulkEditorRenderer<typeof configurable>(
      ({ data, disabled, icon, label, onConfigChange }) => (
        <BulkEditorPopover
          disabled={disabled}
          icon={icon}
          initialData={data}
          label={label}
          onChange={() => undefined}
        >
          {() => (
            <button
              type="button"
              onClick={() =>
                onConfigChange?.((config: { mode: string }) => ({
                  mode: `${config.mode}!`,
                }))
              }
            >
              Change config
            </button>
          )}
        </BulkEditorPopover>
      ),
    ),
    renderGroupingValue: () => null,
  };
  fixture.properties.push({
    id: "configurable",
    name: "Configurable",
    type: "configurable",
    config: { mode: "configured" },
  } as never);
  for (const row of fixture.data) {
    row.properties.configurable = {
      id: `${row.id}-configurable`,
      value: "configured value",
    };
  }
  const propertyChanges: unknown[] = [];
  const table = renderTableView({
    ...fixture,
    plugins: extendDefaultPlugins([configurable], [configurableUi]),
    onPropertiesChange: (change) => propertyChanges.push(change),
    children: <SelectFirstRow />,
  });

  const bar = await screen.findByTestId("bulk-edit-bar");
  await table.user.click(
    within(bar).getByRole("button", { name: "Configurable" }),
  );
  await table.user.click(
    await screen.findByRole("button", { name: "Change config" }),
  );

  await waitFor(() => expect(propertyChanges).toHaveLength(1));
  const change = propertyChanges[0];
  if (!isPropertiesChange(change))
    throw new Error("Expected properties change");
  expect(change.action).toMatchObject({
    type: "properties.update",
    payload: { propertyId: "configurable" },
  });
  expect(
    change.next.find(
      (property: { id: string }) => property.id === "configurable",
    )?.config,
  ).toEqual({ mode: "configured!" });
});

it.each([
  ["all false", [false, false], true],
  ["all true", [true, true], false],
  ["mixed", [true, false], true],
] as const)(
  "BulkEditBar_CheckboxColumn_%s_AppliesOneFinalValueToEverySelectedRow",
  async (_name, values, final) => {
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
    const button = within(bar).getByRole("button", { name: "Complete" });

    await table.user.click(button);

    await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
    const change = onDataChange.mock.calls[0]![0];
    expect(change.action).toMatchObject({
      type: "data.cell.update",
      payload: {
        rowIds: ["row-alpha", "row-empty"],
        propertyId: "complete",
      },
    });
    expect(
      change.next.find((row) => row.id === "row-alpha")?.properties.complete
        ?.value,
    ).toBe(final);
    expect(
      change.next.find((row) => row.id === "row-empty")?.properties.complete
        ?.value,
    ).toBe(final);
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
  const button = within(bar).getByRole("button", { name: "Complete" });
  expect(button).toBeDisabled();

  await user.click(button);

  expect(onDataChange).not.toHaveBeenCalled();
});
