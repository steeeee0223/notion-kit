import { fireEvent, screen, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";

import type { DataResourceAction, Row } from "@notion-kit/table-hook";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import {
  createFullPluginFixture,
  createResourceProbe,
  mockProperties,
  mockResizeObserver,
} from "@/__tests__/mock";

mockResizeObserver();

it("TitleCell_QuickActionAppears_AccessibleNameRemainsStable", async () => {
  const table = renderTableView({
    properties: [
      {
        ...mockProperties[0]!,
        type: "title",
        config: { showIcon: true },
      },
      mockProperties[1]!,
    ],
    getRowUrl: (rowId) => `/rows/${rowId}`,
  });
  const title = table.cellButton("Task 1", "Task 1");

  await table.user.hover(table.row("Task 1"));

  expect(title).toHaveAccessibleName("Task 1");
});

it("TitleListCell_EditCommit_UpdatesRenderedTitleAndResource", async () => {
  const dataProbe = createResourceProbe<Row[], DataResourceAction>();
  const table = renderTableView({
    properties: [
      {
        ...mockProperties[0]!,
        type: "title",
        config: { showIcon: true },
      },
      mockProperties[1]!,
    ],
    onDataChange: dataProbe.onChange,
  });
  const settings = await table.openViewSettings();
  const layout = await settings.openLayout();
  await layout.selectLayout("List");
  await table.clickOutside();

  await table.user.click(screen.getAllByRole("button", { name: "Edit" })[0]!);
  const input = await screen.findByRole("textbox");
  fireEvent.change(input, { target: { value: "Renamed task" } });
  fireEvent.keyDown(input, { key: "Enter" });

  await waitFor(() => expect(dataProbe.onChange).toHaveBeenCalledOnce());
  expect(screen.getByText("Renamed task")).toBeVisible();
  expect(dataProbe.lastChange().action).toMatchObject({
    type: "data.cell.update",
    payload: {
      rowId: "row1",
      propertyId: "col1",
      previousValue: "Task 1",
      nextValue: "Renamed task",
    },
  });
});

it("TitleListCell_EmptyValue_RendersNewPagePlaceholder", async () => {
  const table = renderTableView({
    properties: [
      {
        ...mockProperties[0]!,
        type: "title",
        config: { showIcon: false },
      },
      mockProperties[1]!,
    ],
  });
  const settings = await table.openViewSettings();
  const layout = await settings.openLayout();
  await layout.selectLayout("List");
  await table.clickOutside();

  expect(screen.getByText("New page", { selector: "span" })).toBeVisible();
});

it("TitleListCell_EscapeAfterEditing_CancelsWithoutResourceChange", async () => {
  // Arrange
  const dataProbe = createResourceProbe<Row[], DataResourceAction>();
  const fixture = createFullPluginFixture();
  const table = renderTableView({
    ...fixture,
    view: { ...fixture.view, layout: "list" },
    onDataChange: dataProbe.onChange,
  });
  await table.user.hover(screen.getByText("Alpha"));
  await table.user.click(screen.getAllByRole("button", { name: "Edit" })[0]!);
  const input = await screen.findByRole("textbox");
  fireEvent.change(input, { target: { value: "Discarded title" } });

  // Act
  fireEvent.keyDown(input, { key: "Escape" });

  // Assert
  await waitFor(() => expect(input).not.toBeInTheDocument());
  expect(screen.getByText("Alpha")).toBeVisible();
  expect(dataProbe.onChange).not.toHaveBeenCalled();

  await table.user.hover(screen.getByText("Alpha"));
  await table.user.click(screen.getAllByRole("button", { name: "Edit" })[0]!);
  expect(await screen.findByRole("textbox")).toHaveValue("Alpha");
  expect(dataProbe.onChange).not.toHaveBeenCalled();
});

it("TitleListCell_ClearAndCommit_EmitsExactCellResourcePayload", async () => {
  // Arrange
  const dataProbe = createResourceProbe<Row[], DataResourceAction>();
  const fixture = createFullPluginFixture();
  const table = renderTableView({
    ...fixture,
    view: { ...fixture.view, layout: "list" },
    onDataChange: dataProbe.onChange,
  });
  await table.user.hover(screen.getByText("Alpha"));
  await table.user.click(screen.getAllByRole("button", { name: "Edit" })[0]!);
  const input = await screen.findByRole("textbox");
  fireEvent.change(input, { target: { value: "" } });

  // Act
  fireEvent.keyDown(input, { key: "Enter" });

  // Assert
  await waitFor(() => expect(dataProbe.onChange).toHaveBeenCalledOnce());
  expect(dataProbe.lastChange().action.type).toBe("data.cell.update");
  expect(dataProbe.lastChange().action.payload).toEqual({
    rowId: "row-alpha",
    propertyId: "title",
    previousValue: "Alpha",
    nextValue: "",
  });
  expect(
    screen.getAllByText("New page", { selector: "span" })[0],
  ).toBeVisible();
});
