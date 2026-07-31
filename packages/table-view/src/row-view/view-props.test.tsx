import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { expect, it } from "vitest";

import type { DataResourceAction, Row } from "@notion-kit/table-hook";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import {
  createFullPluginFixture,
  createResourceProbe,
  mockResizeObserver,
} from "@/__tests__/mock";
import { TableView } from "@/table-contexts";

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
  if (!valueTrigger)
    throw new Error(`Expected ${propertyName} to have a value trigger`);

  return { nameTrigger, valueCell, valueTrigger };
}

it("ViewProps_LockedView_DisablesEveryPropertyTrigger", async () => {
  // Arrange
  const { dataProbe } = renderOpenRow(true);
  const rowView = await screen.findByRole("dialog", { name: "Alpha" });

  // Act + Assert
  for (const propertyName of propertyNames) {
    const { nameTrigger, valueCell, valueTrigger } = getPropertySurfaces(
      rowView,
      propertyName,
    );

    expect(nameTrigger).toBeDisabled();
    expect(valueCell).toHaveAttribute("inert");
    expect(valueTrigger).toHaveAttribute("aria-disabled", "true");
    expect(valueTrigger).toHaveAttribute("tabindex", "-1");

    fireEvent.mouseDown(nameTrigger);
    fireEvent.click(nameTrigger);
  }

  for (const propertyName of interactivePropertyNames) {
    const { valueTrigger } = getPropertySurfaces(rowView, propertyName);

    fireEvent.pointerDown(valueTrigger);
    fireEvent.mouseDown(valueTrigger);
    fireEvent.click(valueTrigger);
    fireEvent.keyDown(valueTrigger, { key: "Enter" });
    fireEvent.keyDown(valueTrigger, { key: " " });
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
  await table.user.click(notes.valueTrigger);

  // Assert
  expect(await screen.findByRole("textbox")).toHaveValue("first note");
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
