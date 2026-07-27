import { fireEvent, screen, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";

import type { Row } from "@notion-kit/table-hook";

import { NumberConfigMenuObject } from "@/__tests__/component-objects/number-config-menu";
import {
  renderTableView,
  type TableViewProps,
} from "@/__tests__/component-objects/render-table-view";
import { mockData, mockResizeObserver } from "@/__tests__/mock";

mockResizeObserver();

async function openCalculation(
  propertyName: string,
  props: Partial<TableViewProps> = {},
) {
  const tableView = renderTableView(props);
  fireEvent.click(tableView.footerResult(propertyName));
  return {
    tableView,
    menu: await NumberConfigMenuObject.fromOpenMenu(tableView.user),
  };
}

it("CalcMenu_CheckedCount_DisplaysComputedFooterResult", async () => {
  // Arrange
  const { menu } = await openCalculation("Done");
  await menu.openSubmenu("Count");

  // Act
  menu.choose("Checked");

  // Assert
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Done calculation" }),
    ).toHaveTextContent("2"),
  );
});

it("CalcMenu_UncheckedPercent_DisplaysComputedFooterResult", async () => {
  // Arrange
  const { menu } = await openCalculation("Done");
  await menu.openSubmenu("Percent");

  // Act
  menu.choose("Percent unchecked");

  // Assert
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Done calculation" }),
    ).toHaveTextContent("33.3%"),
  );
});

it("CalcMenu_CappedCountToggle_UpdatesSwitchState", async () => {
  // Arrange
  const { menu } = await openCalculation("Done");
  await menu.openSubmenu("Count");
  const capped = menu.checkbox("Show large counts as 99+");

  // Act
  fireEvent.click(capped);

  // Assert
  expect(capped).toHaveAttribute("aria-checked", "true");
});

const duplicateTextData = mockData.map<Row>((row, index) => ({
  ...row,
  properties: {
    ...row.properties,
    col1: {
      ...row.properties.col1!,
      value: index === 1 ? "" : "Task",
    },
  },
}));

it.each([
  ["All", "Count all", "3"],
  ["Values", "Count values", "2"],
  ["Unique", "Count unique values", "1"],
  ["Empty", "Count empty", "1"],
  ["NotEmpty", "Count not empty", "2"],
] as const)(
  "CalcMenu_Text%s_DisplaysExpectedFooterResult",
  async (_caseName, method, expected) => {
    // Arrange
    const { tableView, menu } = await openCalculation("Name", {
      data: duplicateTextData,
    });
    await menu.openSubmenu("Count");

    // Act
    menu.choose(method);

    // Assert
    await waitFor(() =>
      expect(tableView.footerResult("Name")).toHaveTextContent(expected),
    );
  },
);

it.each([
  ["Empty", "Percent empty", "33.3%"],
  ["NotEmpty", "Percent not empty", "66.7%"],
] as const)(
  "CalcMenu_TextPercent%s_DisplaysExpectedFooterResult",
  async (_caseName, method, expected) => {
    // Arrange
    const { tableView, menu } = await openCalculation("Name");
    await menu.openSubmenu("Percent");

    // Act
    menu.choose(method);

    // Assert
    await waitFor(() =>
      expect(tableView.footerResult("Name")).toHaveTextContent(expected),
    );
  },
);

it.each([
  ["Unchecked", "Count", "Unchecked", "1"],
  ["CheckedPercent", "Percent", "Percent checked", "66.7%"],
] as const)(
  "CalcMenu_Checkbox%s_DisplaysExpectedFooterResult",
  async (_caseName, submenu, method, expected) => {
    // Arrange
    const { tableView, menu } = await openCalculation("Done");
    await menu.openSubmenu(submenu);

    // Act
    menu.choose(method);

    // Assert
    await waitFor(() =>
      expect(tableView.footerResult("Done")).toHaveTextContent(expected),
    );
  },
);

it.each([
  ["All", "Count", "Count all", "0"],
  ["Percent", "Percent", "Percent empty", "0.0%"],
] as const)(
  "CalcMenu_ZeroRows%s_ReturnsStableZeroResult",
  async (_caseName, submenu, method, expected) => {
    // Arrange
    const { tableView, menu } = await openCalculation("Name", { data: [] });
    await menu.openSubmenu(submenu);

    // Act
    menu.choose(method);

    // Assert
    await waitFor(() =>
      expect(tableView.footerResult("Name")).toHaveTextContent(expected),
    );
  },
);

it("CalcMenu_CellEdit_RecomputesFooterResult", async () => {
  // Arrange
  const { tableView, menu } = await openCalculation("Name");
  await menu.openSubmenu("Count");
  menu.choose("Count values");
  await waitFor(() =>
    expect(tableView.footerResult("Name")).toHaveTextContent("2"),
  );

  // Act
  await tableView.user.click(tableView.cellButton("Task 1", "Task 1"));
  const input = await screen.findByRole("textbox");
  await tableView.user.clear(input);
  await tableView.user.keyboard("{Enter}");

  // Assert
  await waitFor(() =>
    expect(tableView.footerResult("Name")).toHaveTextContent("1"),
  );
});

it("CalcMenu_RowAdd_RecomputesFooterResult", async () => {
  // Arrange
  const { tableView, menu } = await openCalculation("Name");
  await menu.openSubmenu("Count");
  menu.choose("Count all");
  await waitFor(() =>
    expect(tableView.footerResult("Name")).toHaveTextContent("3"),
  );

  // Act
  await tableView.user.click(screen.getByRole("button", { name: "New page" }));

  // Assert
  await waitFor(() =>
    expect(tableView.footerResult("Name")).toHaveTextContent("4"),
  );
});

it("CalcMenu_RowDelete_RecomputesFooterResult", async () => {
  // Arrange
  const { tableView, menu } = await openCalculation("Name");
  await menu.openSubmenu("Count");
  menu.choose("Count all");
  await waitFor(() =>
    expect(tableView.footerResult("Name")).toHaveTextContent("3"),
  );

  // Act
  const rowActions = await tableView.openRowActions("Task 1");
  rowActions.choose(/delete/i);

  // Assert
  await waitFor(() =>
    expect(tableView.footerResult("Name")).toHaveTextContent("2"),
  );
});
