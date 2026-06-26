import type React from "react";
import { render } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@notion-kit/ui/primitives";

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

async function renderMenu(children: React.ReactNode) {
  const user = userEvent.setup({
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  });
  render(
    <DropdownMenu defaultOpen modal={false}>
      <DropdownMenuTrigger render={<button type="button">Open</button>} />
      <DropdownMenuContent>{children}</DropdownMenuContent>
    </DropdownMenu>,
  );
  return await NumberConfigMenuObject.fromOpenMenu(user);
}

describe("NumberConfigMenu", () => {
  it("NumberConfigMenu_EditProperty_ShowsFormatAndRoundingTriggers", async () => {
    const menu = await renderMenu(
      <NumberConfigMenu config={config} onChange={vi.fn()} propId="amount" />,
    );

    await menu.openSubmenu(/Edit property/i);
    expect(menu.item(/Number format/i)).toHaveTextContent("Number");
    expect(menu.item(/Decimal places/i)).toHaveTextContent("Default");
  });
});

describe("FormatMenu", () => {
  it("FormatMenu_Hover_OpensCurrencyOption", async () => {
    const menu = await renderMenu(
      <FormatMenu format="number" onUpdate={vi.fn()} />,
    );
    expect(menu.queryCheckbox("Currency")).not.toBeInTheDocument();

    await menu.openSubmenu(/Number format/i);

    expect(menu.checkbox("Currency")).toBeVisible();
  });

  it("FormatMenu_CurrencySelection_CallsOnceAndKeepsParent", async () => {
    const onChange = vi.fn();
    const menu = await renderMenu(
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
    const menu = await renderMenu(
      <RoundingMenu round="default" onUpdate={vi.fn()} />,
    );
    expect(menu.queryCheckbox("2")).not.toBeInTheDocument();

    await menu.openSubmenu(/Decimal places/i);
    expect(menu.checkbox("2")).toBeVisible();
  });

  it("RoundingMenu_TwoSelection_CallsOnceAndKeepsParent", async () => {
    const onChange = vi.fn();
    const menu = await renderMenu(
      <RoundingMenu round="default" onUpdate={onChange} />,
    );
    await menu.openSubmenu(/Decimal places/i);

    menu.choose("2");
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("2");
    expect(menu.item(/Decimal places/i)).toBeInTheDocument();
  });
});
