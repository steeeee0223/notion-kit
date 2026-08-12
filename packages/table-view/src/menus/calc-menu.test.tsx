import { useEffect } from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";

import type { Row } from "@notion-kit/table-hook";

import { NumberConfigMenuObject } from "@/__tests__/component-objects/number-config-menu";
import {
  renderTableView,
  type TableViewProps,
} from "@/__tests__/component-objects/render-table-view";
import { mockData, mockResizeObserver } from "@/__tests__/mock";
import { DEFAULT_PLUGINS, text } from "@/plugins";
import { useTableViewCtx } from "@/table-contexts";

mockResizeObserver();

const customCountingTextPlugin: ReturnType<typeof text> = {
  ...text(),
  counting: [
    {
      group: "Metrics",
      functions: [
        {
          id: "double-total",
          name: "Double total",
          label: "doubled",
          function: ({ rows }) => String(rows.length * 2),
        },
        {
          id: "row-total",
          name: "Rows as text",
          function: ({ rows }) => String(rows.length),
        },
      ],
    },
  ],
};

const customCountingPlugins = [
  ...DEFAULT_PLUGINS.filter((plugin) => plugin.id !== "text"),
  customCountingTextPlugin,
];

function SetColumnCountMethod({ id, method }: { id: string; method: string }) {
  const { table } = useTableViewCtx();

  useEffect(() => {
    if (table.getColumnCounting(id).method !== method) {
      table.setColumnCountMethod(id, method);
    }
  }, [id, method, table]);

  return null;
}

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

it("CalcMenu_CustomPlugin_DiscoversUnhintedMethodsAndUsesDescriptorLabels", async () => {
  // This fails if the menu infers methods from a built-in property type rather
  // than the plugin descriptor, or if an optional hint is treated as required.
  const { tableView, menu } = await openCalculation("Name", {
    plugins: customCountingPlugins,
  });
  expect(screen.queryByRole("menuitem", { name: "Count" })).toBeNull();
  await menu.openSubmenu("Metrics");
  expect(
    screen.queryByRole("menuitemcheckbox", {
      name: "Show large counts as 99+",
    }),
  ).toBeNull();

  menu.choose("Double total");

  await waitFor(() =>
    expect(tableView.footerResult("Name")).toHaveTextContent("doubled6"),
  );
});

it("CalcMenu_CustomPlugin_UsesMethodNameWhenLabelIsAbsent", async () => {
  const { tableView, menu } = await openCalculation("Name", {
    plugins: customCountingPlugins,
  });
  await menu.openSubmenu("Metrics");
  menu.choose("Rows as text");

  await waitFor(() =>
    expect(tableView.footerResult("Name")).toHaveTextContent("Rows as text3"),
  );
});

it("CalcMenu_UnknownSelectedMethod_RendersTheNoneState", async () => {
  // This fails if the footer indexes hint metadata for an unregistered ID.
  const tableView = renderTableView({
    children: <SetColumnCountMethod id="col1" method="removed-method" />,
  });

  await waitFor(() =>
    expect(tableView.footerResult("Name")).toHaveTextContent("Calculate"),
  );
});

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
  await menu.openSubmenu("Percentage");

  // Act
  menu.choose("Unchecked");

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
  ["All", "All", "3"],
  ["Values", "Values", "2"],
  ["Unique", "Unique", "1"],
  ["Empty", "Empty", "1"],
  ["NotEmpty", "Not empty", "2"],
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
  ["Empty", "Empty", "33.3%"],
  ["NotEmpty", "Not empty", "66.7%"],
] as const)(
  "CalcMenu_TextPercent%s_DisplaysExpectedFooterResult",
  async (_caseName, method, expected) => {
    // Arrange
    const { tableView, menu } = await openCalculation("Name");
    await menu.openSubmenu("Percentage");

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
  ["CheckedPercent", "Percentage", "Checked", "66.7%"],
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
  ["All", "Count", "All", "0"],
  ["Percent", "Percentage", "Empty", "0.0%"],
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
  menu.choose("Values");
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
  menu.choose("All");
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
  menu.choose("All");
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
