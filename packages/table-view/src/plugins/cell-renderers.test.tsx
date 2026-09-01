import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type {
  ColumnInfo,
  DataResourceAction,
  Row,
} from "@notion-kit/table-hook";
import type {
  MultiSelectPlugin,
  NumberConfig,
} from "@notion-kit/table-hook/plugins";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import {
  createFullPluginFixture,
  createResourceProbe,
  mockResizeObserver,
} from "@/__tests__/mock";

import { LinkCellValue } from "./link/link-cell";
import { NumberCellValue } from "./number/number-cell";

mockResizeObserver();

const row: Row = {
  id: "row",
  createdAt: 0,
  lastEditedAt: 0,
  properties: {},
};

const baseNumberConfig: NumberConfig = {
  format: "number",
  round: "default",
  showAs: "number",
  options: { color: "green", divideBy: 100, showNumber: true },
};

function renderNumber(
  data: string | null,
  config: NumberConfig,
  overrides: Partial<React.ComponentProps<typeof NumberCellValue>> = {},
) {
  const renderCell = (
    nextOverrides: Partial<React.ComponentProps<typeof NumberCellValue>> = {},
  ) => (
    <NumberCellValue
      propId="amount"
      row={row}
      data={data}
      config={config}
      {...overrides}
      {...nextOverrides}
    />
  );
  const view = render(renderCell());
  return {
    ...view,
    rerenderNumber: (nextOverrides = {}) =>
      view.rerender(renderCell(nextOverrides)),
  };
}

function renderNumberEditor(data: string | null, config = baseNumberConfig) {
  const fixture = createFullPluginFixture();
  fixture.properties.find((property) => property.id === "score")!.config =
    config;
  fixture.data.find(
    (item) => item.id === "row-alpha",
  )!.properties.score!.value = data;
  const dataProbe = createResourceProbe<Row[], DataResourceAction>();
  const table = renderTableView({
    ...fixture,
    onDataChange: dataProbe.onChange,
  });
  return { dataProbe, table };
}

describe("NumberCell", () => {
  it.each([
    ["plain", { format: "number", round: "2" }, "1234.56"],
    ["commas", { format: "number_with_commas", round: "2" }, "1,234.56"],
    ["percent", { format: "percent", round: "1" }, "1,234.6%"],
    ["currency", { format: "currency", round: "0" }, "$1,235"],
  ] as const)(
    "NumberDisplay_%s_FormatsVisibleValue",
    (_case, partial, expected) => {
      renderNumber("1234.56", { ...baseNumberConfig, ...partial });
      expect(screen.getByText(expected)).toBeVisible();
    },
  );

  it.each(["bar", "ring"] as const)(
    "NumberDisplay_%s_CapsProgressButRetainsVisibleValue",
    (showAs) => {
      renderNumber("150", {
        ...baseNumberConfig,
        showAs,
        options: { ...baseNumberConfig.options, divideBy: 100 },
      });

      expect(screen.getByText("150")).toBeVisible();
      const meter = screen.getByRole("meter");
      expect(meter).toHaveAttribute("aria-valuenow", "100");
      expect(meter).toHaveAttribute("aria-valuemax", "100");
    },
  );

  it.each(["number", "bar", "ring"] as const)(
    "NumberDisplay_Wrapped%s_TogglesWrappingWithoutChangingPresentation",
    (showAs) => {
      // Arrange
      const { container, rerenderNumber } = renderNumber(
        "150",
        {
          ...baseNumberConfig,
          showAs,
        },
        { wrapped: true },
      );

      // Act
      const displayedValue = screen.getByText("150");

      // Assert
      expect(displayedValue).toBeVisible();
      expect(container.querySelector(".whitespace-pre-wrap")).not.toBeNull();
      if (showAs !== "number") {
        expect(screen.getByRole("meter")).toBeVisible();
      }

      // Act
      rerenderNumber({ wrapped: false });

      // Assert
      expect(screen.getByText("150")).toBeVisible();
      expect(container.querySelector(".whitespace-pre-wrap")).toBeNull();
      if (showAs !== "number") {
        expect(screen.getByRole("meter")).toBeVisible();
      }
    },
  );

  it("NumberDisplay_CorruptPersistedValue_RendersAnEmptyDisplay", () => {
    // Arrange
    const { container } = renderNumber("not-a-number", baseNumberConfig);

    // Assert
    expect(container).toHaveTextContent("");
    expect(container).not.toHaveTextContent("NaN");
  });

  it("NumberEditor_ValidInvalidAndEmpty_CommitCanonicalValues", async () => {
    const user = userEvent.setup();
    const { dataProbe, table } = renderNumberEditor("12");
    await user.click(table.cellButton("Alpha", "12"));
    const input = await screen.findByRole("textbox");
    await user.clear(input);
    await user.type(input, "-2.5{Enter}");
    expect(dataProbe.lastChange().action).toMatchObject({
      type: "data.cell.update",
      payload: { nextValue: "-2.5" },
    });

    await user.click(table.cellButton("Alpha", "-2.5"));
    await user.clear(await screen.findByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "invalid{Enter}");
    expect(dataProbe.lastChange().action).toMatchObject({
      type: "data.cell.update",
      payload: { nextValue: null },
    });

    await user.click(
      within(table.propertyCell("Alpha", "score")).getByRole("button", {
        name: "",
      }),
    );
    await user.clear(await screen.findByRole("textbox"));
    await user.keyboard("{Enter}");
    expect(dataProbe.lastChange().action).toMatchObject({
      type: "data.cell.update",
      payload: { nextValue: null },
    });
  });

  it("NumberEditor_EscapeAfterEditing_CancelsWithoutChange", async () => {
    // Arrange
    const user = userEvent.setup();
    const { dataProbe, table } = renderNumberEditor("12");
    await user.click(table.cellButton("Alpha", "12"));
    const input = await screen.findByRole("textbox");
    await user.clear(input);
    await user.type(input, "99");

    // Act
    await user.keyboard("{Escape}");

    // Assert
    await waitFor(() => expect(input).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "12" })).toBeVisible();
    expect(dataProbe.onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "12" }));
    expect(await screen.findByRole("textbox")).toHaveValue("12");
    expect(dataProbe.onChange).not.toHaveBeenCalled();
  });

  it.each([
    ["Default", "default", "1.235"],
    ["ThreePlace", "3", "1.235"],
    ["FourPlace", "4", "1.2346"],
    ["FivePlace", "5", "1.23457"],
  ] as const)(
    "NumberDisplay_%sRounding_RendersSupportedPrecisionBoundary",
    (_scenario, round, expected) => {
      // Arrange
      renderNumber("1.234567", { ...baseNumberConfig, round });

      // Act
      const displayedValue = screen.getByText(expected);

      // Assert
      expect(displayedValue).toBeVisible();
    },
  );
});

describe("SelectCell", () => {
  it("SelectCell_StaleDescribedWrappedOption_FiltersWrapsAndExplainsConfiguredTag", async () => {
    // Arrange
    const fixture = createFullPluginFixture();
    const tags = fixture.properties.find(
      (property) => property.id === "tags",
    ) as ColumnInfo<MultiSelectPlugin>;
    tags.wrapped = true;
    const frontend = tags.config.options.items.Frontend!;
    frontend.description = "Client work";
    fixture.data[0]!.properties.tags!.value = ["Missing", "Frontend"];
    const table = renderTableView(fixture);

    // Act
    const alpha = table.row("Alpha");
    const frontendTag = within(alpha).getByText("Frontend");
    const tooltipTrigger = frontendTag.closest<HTMLElement>(
      "[data-base-ui-tooltip-trigger]",
    );

    // Assert
    expect(frontendTag).toBeVisible();
    expect(frontendTag.closest(".flex-wrap")).not.toBeNull();
    expect(tooltipTrigger).not.toBeNull();
    expect(alpha).not.toHaveTextContent("Missing");

    // Act
    await table.user.hover(frontendTag);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Client work")).toBeVisible();
    });
  });

  it("SelectCell_EmptyRowView_RendersAnExplicitEmptyValue", () => {
    // Arrange
    const fixture = createFullPluginFixture();
    renderTableView({
      ...fixture,
      view: {
        layout: "table",
        rowView: "side",
        openedRowId: "row-empty",
      },
    });

    // Act
    const statusRow = screen.getByRole("row", { name: /Status Empty/i });

    // Assert
    expect(statusRow).toBeVisible();
  });
});

describe("LinkCell", () => {
  it.each([
    ["email", "alpha@example.com", "mailto:alpha@example.com"],
    ["phone", "+886900000001", "tel:+886900000001"],
    ["url", "https://example.com", "https://example.com"],
    ["url", "  JAVASCRIPT:alert(1)", ""],
  ] as const)("LinkCell_%s_UsesSafeExpectedHref", (type, data, href) => {
    render(
      <LinkCellValue
        type={type}
        propId="link"
        row={row}
        data={data}
        config={undefined}
      />,
    );
    expect(screen.getByText(data.trim()).closest("a")).toHaveAttribute(
      "href",
      href,
    );
  });
});

describe("TextAndCheckboxCells", () => {
  it("TextCell_EscapeAfterEditing_CancelsWithoutResourceChange", async () => {
    // Arrange
    const dataProbe = createResourceProbe<Row[], DataResourceAction>();
    const table = renderTableView({
      ...createFullPluginFixture(),
      onDataChange: dataProbe.onChange,
    });
    await table.user.click(table.cellButton("Alpha", "first note"));
    const input = await screen.findByRole("textbox");
    await table.user.clear(input);
    await table.user.type(input, "discarded note");

    // Act
    await table.user.keyboard("{Escape}");

    // Assert
    await waitFor(() => expect(input).not.toBeInTheDocument());
    expect(table.row("Alpha")).toHaveTextContent("first note");
    expect(dataProbe.onChange).not.toHaveBeenCalled();

    await table.user.click(table.cellButton("Alpha", "first note"));
    expect(await screen.findByRole("textbox")).toHaveValue("first note");
    expect(dataProbe.onChange).not.toHaveBeenCalled();
  });

  it("TextCell_ClearAndCommit_EmitsExactCellResourcePayload", async () => {
    // Arrange
    const dataProbe = createResourceProbe<Row[], DataResourceAction>();
    const table = renderTableView({
      ...createFullPluginFixture(),
      onDataChange: dataProbe.onChange,
    });
    await table.user.click(table.cellButton("Alpha", "first note"));
    const input = await screen.findByRole("textbox");
    await table.user.clear(input);

    // Act
    await table.user.keyboard("{Enter}");

    // Assert
    await waitFor(() => expect(dataProbe.onChange).toHaveBeenCalledOnce());
    expect(dataProbe.lastChange().action.type).toBe("data.cell.update");
    expect(dataProbe.lastChange().action.payload).toEqual({
      rowId: "row-alpha",
      propertyId: "notes",
      previousValue: "first note",
      nextValue: "",
    });
  });

  it.each(["pointer", "keyboard"] as const)(
    "CheckboxCellTrigger_Unchecked%sActivation_ExposesStateAndEmitsExactCellResourcePayload",
    async (activation) => {
      // Arrange
      const dataProbe = createResourceProbe<Row[], DataResourceAction>();
      const table = renderTableView({
        ...createFullPluginFixture(),
        onDataChange: dataProbe.onChange,
      });
      const cellTrigger = table.checkboxCellTrigger("Empty");
      const checkbox = table.checkboxCellDisplay("Empty");

      expect(checkbox).toHaveAttribute("aria-checked", "false");

      // Act
      if (activation === "pointer") {
        await table.user.click(cellTrigger);
      } else {
        cellTrigger.focus();
        await table.user.keyboard(" ");
      }

      // Assert
      await waitFor(() => expect(dataProbe.onChange).toHaveBeenCalledOnce());
      expect(checkbox).toHaveAttribute("aria-checked", "true");
      expect(dataProbe.lastChange().action.type).toBe("data.cell.update");
      expect(dataProbe.lastChange().action.payload).toEqual({
        rowId: "row-empty",
        propertyId: "complete",
        previousValue: false,
        nextValue: true,
      });
    },
  );
});
