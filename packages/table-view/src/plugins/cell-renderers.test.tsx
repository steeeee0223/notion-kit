import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Row } from "@notion-kit/table-hook";

import { mockResizeObserver } from "@/__tests__/mock";

import { CheckboxCell } from "./checkbox/checkbox-cell";
import { LinkCell } from "./link/link-cell";
import { NumberCell } from "./number/number-cell";
import type { NumberConfig } from "./number/types";
import { TextCell } from "./text/text-cell";

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
  overrides: Partial<React.ComponentProps<typeof NumberCell>> = {},
) {
  const onChange = vi.fn();
  const view = render(
    <NumberCell
      propId="amount"
      row={row}
      data={data}
      config={config}
      layout="table"
      onChange={onChange}
      {...overrides}
    />,
  );
  return { ...view, onChange };
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
});

describe("LinkCell", () => {
  it.each([
    ["email", "alpha@example.com", "mailto:alpha@example.com"],
    ["phone", "+886900000001", "tel:+886900000001"],
    ["url", "https://example.com", "https://example.com"],
    ["url", "  JAVASCRIPT:alert(1)", ""],
  ] as const)("LinkCell_%s_UsesSafeExpectedHref", (type, data, href) => {
    render(
      <LinkCell
        type={type}
        propId="link"
        row={row}
        data={data}
        config={undefined}
        layout="table"
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText(data.trim()).closest("a")).toHaveAttribute(
      "href",
      href,
    );
  });

  it("LinkCell_EmptyRowAndBoard_ExposeOnlyMeaningfulContent", () => {
    const { rerender } = render(
      <LinkCell
        type="url"
        propId="link"
        row={row}
        data=""
        config={undefined}
        layout="row-view"
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Empty")).toBeVisible();

    rerender(
      <LinkCell
        type="url"
        propId="link"
        row={row}
        data=""
        config={undefined}
        layout="board"
        onChange={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("TextAndCheckboxCells", () => {
  it("TextCell_RowViewEmptyAndBoardEmpty_DistinguishEditableBoundary", () => {
    const common = {
      propId: "text",
      row,
      data: "",
      config: undefined,
      onChange: vi.fn(),
    };
    const { rerender } = render(<TextCell {...common} layout="row-view" />);
    expect(screen.getByText("Empty")).toBeVisible();
    rerender(<TextCell {...common} layout="board" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("CheckboxCell_PointerActivation_TogglesFromPreviousValue", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CheckboxCell
        propId="done"
        row={row}
        data={false}
        config={undefined}
        layout="table"
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenCalledOnce();
    const updater = onChange.mock.calls[0]![0] as (value: boolean) => boolean;
    expect(updater(false)).toBe(true);
    expect(updater(true)).toBe(false);
  });
});
