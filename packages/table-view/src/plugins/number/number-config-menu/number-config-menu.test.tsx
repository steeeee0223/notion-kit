import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NumberConfigMenuObject } from "@/__tests__/component-objects/number-config-menu";

import type { NumberConfig } from "../types";
import { FormatMenu } from "./format-menu";
import { NumberConfigMenu } from "./number-config-menu";
import { RoundingMenu } from "./rounding-menu";

const config: NumberConfig = {
  format: "number",
  round: "default",
  showAs: "number",
  options: { color: "green", divideBy: 100, showNumber: true },
};

describe("NumberConfigMenu", () => {
  it("NumberConfigMenu_EditProperty_ShowsFormatAndRoundingTriggers", async () => {
    const menu = await NumberConfigMenuObject.renderOpen(
      <NumberConfigMenu config={config} onChange={vi.fn()} propId="amount" />,
    );

    await menu.openSubmenu(/Edit property/i);
    expect(menu.item(/Number format/i)).toHaveTextContent("Number");
    expect(menu.item(/Decimal places/i)).toHaveTextContent("Default");
  });

  it("NumberConfigMenu_BarSelection_UpdatesOnlyDisplayType", async () => {
    const onChange = vi.fn();
    const menu = await NumberConfigMenuObject.renderOpen(
      <NumberConfigMenu config={config} onChange={onChange} propId="amount" />,
    );
    await menu.openSubmenu(/Edit property/i);

    fireEvent.click(screen.getByRole("button", { name: /Bar$/ }));

    const updater = onChange.mock.calls[0]?.[0] as (
      value: NumberConfig,
    ) => NumberConfig;
    expect(updater(config)).toEqual({ ...config, showAs: "bar" });
  });

  it("NumberConfigMenu_BarOptions_MergeDivideByWithoutLosingColor", async () => {
    const barConfig: NumberConfig = { ...config, showAs: "bar" };
    const onChange = vi.fn();
    const menu = await NumberConfigMenuObject.renderOpen(
      <NumberConfigMenu
        config={barConfig}
        onChange={onChange}
        propId="amount"
      />,
    );
    await menu.openSubmenu(/Edit property/i);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "25" } });
    fireEvent.blur(input);

    const updater = onChange.mock.calls[0]?.[0] as (
      value: NumberConfig,
    ) => NumberConfig;
    expect(updater(barConfig)).toEqual({
      ...barConfig,
      options: { ...barConfig.options, divideBy: 25 },
    });
  });
});

describe("FormatMenu", () => {
  it("FormatMenu_Hover_OpensCurrencyOption", async () => {
    const menu = await NumberConfigMenuObject.renderOpen(
      <FormatMenu format="number" onUpdate={vi.fn()} />,
    );
    expect(menu.queryCheckbox("Currency")).not.toBeInTheDocument();

    await menu.openSubmenu(/Number format/i);

    expect(menu.checkbox("Currency")).toBeVisible();
  });

  it("FormatMenu_CurrencySelection_CallsOnceAndKeepsParent", async () => {
    const onChange = vi.fn();
    const menu = await NumberConfigMenuObject.renderOpen(
      <FormatMenu format="number" onUpdate={onChange} />,
    );
    await menu.openSubmenu(/Number format/i);

    menu.choose("Currency");
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("currency");
    expect(menu.item(/Number format/i)).toBeInTheDocument();
  });
});

describe("RoundingMenu", () => {
  it("RoundingMenu_Hover_OpensDecimalOptions", async () => {
    const menu = await NumberConfigMenuObject.renderOpen(
      <RoundingMenu round="default" onUpdate={vi.fn()} />,
    );
    expect(menu.queryCheckbox("2")).not.toBeInTheDocument();

    await menu.openSubmenu(/Decimal places/i);
    expect(menu.checkbox("2")).toBeVisible();
  });

  it("RoundingMenu_TwoSelection_CallsOnceAndKeepsParent", async () => {
    const onChange = vi.fn();
    const menu = await NumberConfigMenuObject.renderOpen(
      <RoundingMenu round="default" onUpdate={onChange} />,
    );
    await menu.openSubmenu(/Decimal places/i);

    menu.choose("2");
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("2");
    expect(menu.item(/Decimal places/i)).toBeInTheDocument();
  });
});
