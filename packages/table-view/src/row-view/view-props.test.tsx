import { useEffect } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";

import type {
  ColumnInfo,
  DataResourceAction,
  Row,
} from "@notion-kit/table-hook";
import type { CellPlugin } from "@notion-kit/table-hook/plugins";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import {
  createFullPluginFixture,
  createResourceProbe,
  mockResizeObserver,
} from "@/__tests__/mock";
import { title } from "@/plugins";
import { TableView, useTableViewCtx } from "@/table-contexts";

mockResizeObserver();

const propertyNames = [
  "Notes",
  "Score",
  "Status",
  "Tags",
  "Complete",
  "Due",
  "Email",
  "Phone",
  "Website",
  "Created",
  "Edited",
] as const;

const interactivePropertyNames = [
  "Notes",
  "Score",
  "Status",
  "Tags",
  "Complete",
  "Due",
  "Email",
  "Phone",
  "Website",
] as const;

const directUpdatePlugin: CellPlugin<"direct-update", string, string> = {
  id: "direct-update",
  meta: { name: "Direct update", desc: "", icon: null },
  default: {
    name: "Direct update",
    icon: null,
    data: "",
    config: "default config",
  },
  fromValue: (value) => value?.toString() ?? "",
  toValue: (data) => data,
  toTextValue: (data) => data,
  renderCellValue: () => null,
  renderCellEditor: ({ onChange, onConfigChange }) => ({
    presentation: "inline",
    content: (
    <button
      type="button"
      onClick={() => {
        onChange("blocked update");
        onConfigChange?.("blocked config");
      }}
    >
      Force mutation
    </button>
    ),
  }),
};

function renderOpenRow(locked: boolean) {
  const dataProbe = createResourceProbe<Row[], DataResourceAction>();
  const fixture = createFullPluginFixture();
  const table = renderTableView({
    ...fixture,
    view: {
      ...fixture.view,
      openedRowId: "row-alpha",
      locked,
    },
    onDataChange: dataProbe.onChange,
  });

  return { dataProbe, table };
}

function getPropertySurfaces(container: HTMLElement, propertyName: string) {
  const nameTrigger = within(container).getByRole("button", {
    name: propertyName,
  });
  const row = nameTrigger.closest<HTMLElement>('[role="row"]');
  if (!row) throw new Error(`Expected ${propertyName} to belong to a row`);
  const cells = within(row).getAllByRole("cell");
  const valueCell = cells[1];
  if (!valueCell) throw new Error(`Expected ${propertyName} to have a value`);
  const valueTrigger = valueCell.querySelector<HTMLElement>(
    '[role="button"][aria-disabled]',
  );
  const valueCheckbox = within(valueCell).queryByRole("checkbox");
  const valueControl = valueTrigger ?? valueCheckbox;
  if (!valueControl)
    throw new Error(`Expected ${propertyName} to have an editable control`);

  return { nameTrigger, valueCell, valueControl };
}

interface LockViewControlProps {
  onReady: (lockView: () => void) => void;
}

function LockViewControl({ onReady }: LockViewControlProps) {
  const { table } = useTableViewCtx();

  useEffect(() => onReady(table.toggleTableLocked), [onReady, table]);

  return null;
}

it("ViewProps_LockedView_DisablesEveryPropertyTrigger", async () => {
  // Arrange
  const { dataProbe } = renderOpenRow(true);
  const rowView = await screen.findByRole("dialog", { name: "Alpha" });

  // Act + Assert
  for (const propertyName of propertyNames) {
    const { nameTrigger, valueCell, valueControl } = getPropertySurfaces(
      rowView,
      propertyName,
    );

    expect(nameTrigger).toBeDisabled();
    expect(valueCell).toHaveAttribute("inert");
    if (propertyName === "Complete") {
      expect(valueControl).toHaveRole("checkbox");
      expect(valueControl).toHaveAttribute("aria-disabled", "true");
      expect(valueControl).toHaveAttribute("tabindex", "-1");
    } else {
      expect(valueControl).toHaveAttribute("aria-disabled", "true");
      expect(valueControl).toHaveAttribute("tabindex", "-1");
    }

    fireEvent.mouseDown(nameTrigger);
    fireEvent.click(nameTrigger);
  }

  for (const propertyName of interactivePropertyNames) {
    const { valueControl } = getPropertySurfaces(rowView, propertyName);

    fireEvent.pointerDown(valueControl);
    fireEvent.mouseDown(valueControl);
    fireEvent.click(valueControl);
    fireEvent.keyDown(valueControl, { key: "Enter" });
    fireEvent.keyDown(valueControl, { key: " " });
  }

  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /next month/i }),
  ).not.toBeInTheDocument();
  expect(dataProbe.onChange).not.toHaveBeenCalled();
});

it("ViewProps_UnlockedView_PropertyTriggerStillOpens", async () => {
  // Arrange
  const { table } = renderOpenRow(false);
  const rowView = await screen.findByRole("dialog", { name: "Alpha" });
  const notes = getPropertySurfaces(rowView, "Notes");

  // Act
  await table.user.click(notes.nameTrigger);

  // Assert
  expect(
    await screen.findByRole("menuitem", { name: "Change type" }),
  ).toBeVisible();

  // Act
  await table.user.keyboard("{Escape}");
  await table.user.click(notes.valueControl);

  // Assert
  expect(await screen.findByRole("textbox")).toHaveValue("first note");
});

it("ViewProps_LockTransition_ClosesOpenEditorWithoutDataChange", async () => {
  // Arrange
  const dataProbe = createResourceProbe<Row[], DataResourceAction>();
  const fixture = createFullPluginFixture();
  let lockView: (() => void) | undefined;
  const captureLockView = (toggleLocked: () => void) => {
    lockView = toggleLocked;
  };
  const table = renderTableView({
    ...fixture,
    view: {
      ...fixture.view,
      openedRowId: "row-alpha",
    },
    onDataChange: dataProbe.onChange,
    children: <LockViewControl onReady={captureLockView} />,
  });
  const rowView = await screen.findByRole("dialog", { name: "Alpha" });
  const notes = getPropertySurfaces(rowView, "Notes");
  await table.user.click(notes.valueControl);
  const editor = await screen.findByRole("textbox");
  fireEvent.change(editor, { target: { value: "blocked update" } });

  // Act
  expect(lockView).toBeDefined();
  act(() => lockView?.());
  const editorClosedOnLock = !editor.isConnected;
  fireEvent.keyDown(editor, { key: "Enter" });

  // Assert
  expect(editorClosedOnLock).toBe(true);
  expect(editor).not.toBeInTheDocument();
  expect(rowView).toHaveTextContent("first note");
  expect(dataProbe.onChange).not.toHaveBeenCalled();
});

it("TableCell_LockedView_BlocksPluginMutationDispatch", async () => {
  // Arrange
  const plugins = [title(), directUpdatePlugin];
  const properties: ColumnInfo<(typeof plugins)[number]>[] = [
    {
      id: "title",
      name: "Name",
      type: "title",
      width: "220",
      config: { showIcon: true },
    },
    {
      id: "direct",
      name: "Direct",
      type: "direct-update",
      width: "180",
      config: "original config",
    },
  ];
  const data: Row<typeof plugins>[] = [
    {
      id: "row",
      createdAt: 0,
      lastEditedAt: 0,
      properties: {
        title: { id: "title-cell", value: "Row" },
        direct: { id: "direct-cell", value: "original value" },
      },
    },
  ];
  const onDataChange = vi.fn();
  const onPropertiesChange = vi.fn();
  render(
    <TableView
      plugins={plugins}
      data={data}
      properties={properties}
      view={{ locked: true, openedRowId: "row", rowView: "side" }}
      onDataChange={onDataChange}
      onPropertiesChange={onPropertiesChange}
    />,
  );
  const rowView = await screen.findByRole("dialog", { name: "Row" });

  // Act
  fireEvent.click(
    within(rowView).getByRole("button", { name: "Force mutation" }),
  );

  // Assert
  expect(onDataChange).not.toHaveBeenCalled();
  expect(onPropertiesChange).not.toHaveBeenCalled();
});

it("ViewProps_LockedView_KeepsRowNavigationUsable", async () => {
  // Arrange
  const fixture = createFullPluginFixture();
  render(
    <TableView
      defaultData={fixture.data}
      defaultProperties={fixture.properties}
      defaultView={{
        ...fixture.view,
        openedRowId: "row-alpha",
        locked: true,
      }}
    />,
  );
  let rowView = await screen.findByRole("dialog", { name: "Alpha" });

  // Act
  fireEvent.click(within(rowView).getByRole("button", { name: "Next row" }));

  // Assert
  rowView = await screen.findByRole("dialog", { name: "Empty" });

  // Act
  fireEvent.click(
    within(rowView).getByRole("button", { name: "Previous row" }),
  );

  // Assert
  rowView = await screen.findByRole("dialog", { name: "Alpha" });

  // Act
  fireEvent.click(within(rowView).getByRole("button", { name: "Close row" }));

  // Assert
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Alpha" }),
    ).not.toBeInTheDocument(),
  );
});
