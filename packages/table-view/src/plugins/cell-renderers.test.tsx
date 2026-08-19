import { useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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

import { CheckboxCellEditor } from "./checkbox/checkbox-cell";
import { checkbox as createCheckbox } from "./checkbox/plugin";
import { LinkCellValue } from "./link/link-cell";
import { NumberCellValue } from "./number/number-cell";
import { TextCellValue } from "./text/text-cell";

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
  const onChange = vi.fn();
  const renderCell = (
    nextOverrides: Partial<React.ComponentProps<typeof NumberCellValue>> = {},
  ) => (
    <NumberCellValue
      propId="amount"
      row={row}
      data={data}
      config={config}
      layout="table"
      {...overrides}
      {...nextOverrides}
    />
  );
  const view = render(renderCell());
  return {
    ...view,
    onChange,
    rerenderNumber: (nextOverrides = {}) =>
      view.rerender(renderCell(nextOverrides)),
  };
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
    renderNumber("not-a-number", baseNumberConfig);

    // Act
    const trigger = screen
      .getAllByRole("button")
      .find((button) => button.getAttribute("aria-haspopup") === "dialog");

    // Assert
    expect(trigger).toBeDefined();
    expect(trigger).toHaveTextContent("");
    expect(trigger).not.toHaveTextContent("NaN");
  });

  it("NumberDisplay_RowViewEmpty_ShowsExplicitEmpty", () => {
    renderNumber(null, baseNumberConfig, { layout: "row-view" });
    expect(screen.getByText("Empty")).toBeVisible();
  });

  it("NumberDisplay_NullBoardValue_RendersNothing", () => {
    const { container } = renderNumber(null, baseNumberConfig, {
      layout: "board",
    });
    expect(container).toBeEmptyDOMElement();
  });

  it("NumberEditor_ValidInvalidAndEmpty_CommitCanonicalValues", async () => {
    const user = userEvent.setup();
    const { onChange } = renderNumber("12", baseNumberConfig);
    await user.click(screen.getByRole("button", { name: "12" }));
    const input = await screen.findByRole("textbox");
    await user.clear(input);
    await user.type(input, "-2.5{Enter}");
    expect(onChange).toHaveBeenLastCalledWith("-2.5");

    await user.click(screen.getByRole("button", { name: "12" }));
    await user.clear(await screen.findByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "invalid{Enter}");
    expect(onChange).toHaveBeenLastCalledWith(null);

    await user.click(screen.getByRole("button", { name: "12" }));
    await user.clear(await screen.findByRole("textbox"));
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("NumberEditor_EscapeAfterEditing_CancelsWithoutChange", async () => {
    // Arrange
    const user = userEvent.setup();
    const { onChange } = renderNumber("12", baseNumberConfig);
    await user.click(screen.getByRole("button", { name: "12" }));
    const input = await screen.findByRole("textbox");
    await user.clear(input);
    await user.type(input, "99");

    // Act
    await user.keyboard("{Escape}");

    // Assert
    await waitFor(() => expect(input).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "12" })).toBeVisible();
    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "12" }));
    expect(await screen.findByRole("textbox")).toHaveValue("12");
    expect(onChange).not.toHaveBeenCalled();
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
        layout="table"
      />,
    );
    expect(screen.getByText(data.trim()).closest("a")).toHaveAttribute(
      "href",
      href,
    );
  });

  it("LinkCell_EmptyRowAndBoard_ExposeOnlyMeaningfulContent", () => {
    const { rerender } = render(
      <LinkCellValue
        type="url"
        propId="link"
        row={row}
        data=""
        config={undefined}
        layout="row-view"
      />,
    );
    expect(screen.getByText("Empty")).toBeVisible();

    rerender(
      <LinkCellValue
        type="url"
        propId="link"
        row={row}
        data=""
        config={undefined}
        layout="board"
      />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("TextAndCheckboxCells", () => {
  it("CheckboxRegistryEditor_CellScope_RendersAnInlineToggleThatPersistsItsNewValue", async () => {
    const user = userEvent.setup();

    function CheckboxEditorHarness() {
      const [value, setValue] = useState(false);
      const plugin = createCheckbox();
      const editor = plugin.renderCellEditor?.({
        propId: "done",
        data: value,
        config: undefined,
        layout: "table",
        onChange: setValue,
        scope: { kind: "cell", row },
      });

      return <>{editor?.content}</>;
    }

    render(<CheckboxEditorHarness />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("TextCell_RowViewEmptyAndBoardEmpty_DistinguishEditableBoundary", () => {
    const common = {
      propId: "text",
      row,
      data: "",
      config: undefined,
      onChange: vi.fn(),
    };
    const { rerender } = render(<TextCellValue {...common} layout="row-view" />);
    expect(screen.getByText("Empty")).toBeVisible();
    rerender(<TextCellValue {...common} layout="board" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("CheckboxCell_PointerActivation_TogglesFromPreviousValue", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CheckboxCellEditor
        propId="done"
        data={false}
        config={undefined}
        layout="table"
        onChange={onChange}
        scope={{ kind: "cell", row }}
      />,
    );

    await user.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(true);
  });

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

  it("CheckboxCell_UncheckedPointerActivation_EmitsExactCellResourcePayload", async () => {
    // Arrange
    const dataProbe = createResourceProbe<Row[], DataResourceAction>();
    const table = renderTableView({
      ...createFullPluginFixture(),
      onDataChange: dataProbe.onChange,
    });
    const checkbox = within(table.row("Empty"))
      .getAllByRole("checkbox")
      .find(
        (element) =>
          !element.hasAttribute("aria-label") &&
          !element.hasAttribute("aria-labelledby"),
      );
    expect(checkbox).toBeDefined();

    // Act
    await table.user.click(checkbox!);

    // Assert
    await waitFor(() => expect(dataProbe.onChange).toHaveBeenCalledOnce());
    expect(dataProbe.lastChange().action.type).toBe("data.cell.update");
    expect(dataProbe.lastChange().action.payload).toEqual({
      rowId: "row-empty",
      propertyId: "complete",
      previousValue: false,
      nextValue: true,
    });
  });
});
