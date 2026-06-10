import type React from "react";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@notion-kit/ui/primitives";

import { FormatMenu } from "./format-menu";
import { NumberConfigMenu } from "./number-config-menu";
import { RoundingMenu } from "./rounding-menu";
import type { NumberConfig } from "../types";

const config: NumberConfig = {
  format: "number",
  round: "default",
  showAs: "number",
  options: { color: "green", divideBy: 100, showNumber: true },
};

function renderNumberConfigMenu(onChange = vi.fn()) {
  renderInsideDropdown(
    <NumberConfigMenu config={config} onChange={onChange} propId="amount" />,
  );
}

function renderInsideDropdown(children: React.ReactNode) {
  render(
    <DropdownMenu defaultOpen modal={false}>
      <DropdownMenuTrigger render={<button type="button">Open</button>} />
      <DropdownMenuContent>{children}</DropdownMenuContent>
    </DropdownMenu>,
  );
}

function setupSubmenuUser() {
  return userEvent.setup({
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  });
}

async function openEditPropertySubmenu(user: ReturnType<typeof userEvent.setup>) {
  const editProperty = screen.getByRole("menuitem", {
    name: /Edit property/i,
  });
  await user.hover(editProperty);

  await screen.findByRole("menuitem", { name: /Number format/i });
}

describe("NumberConfigMenu", () => {
  it("shows format and rounding as submenu triggers inside edit property", async () => {
    const user = setupSubmenuUser();
    renderNumberConfigMenu();

    await openEditPropertySubmenu(user);

    expect(
      screen.getByRole("menuitem", { name: /Number format/i }),
    ).toHaveTextContent("Number");
    expect(
      screen.getByRole("menuitem", { name: /Decimal places/i }),
    ).toHaveTextContent("Default");
  });
});

describe("FormatMenu", () => {
  it("opens number format as a submenu", async () => {
    const user = setupSubmenuUser();
    renderInsideDropdown(<FormatMenu format="number" onUpdate={vi.fn()} />);

    const formatTrigger = screen.getByRole("menuitem", {
      name: /Number format/i,
    });
    expect(formatTrigger).toHaveTextContent("Number");
    expect(
      screen.queryByRole("menuitemcheckbox", { name: "Currency" }),
    ).not.toBeInTheDocument();

    await user.hover(formatTrigger);

    expect(
      await screen.findByRole("menuitemcheckbox", { name: "Currency" }),
    ).toBeInTheDocument();
  });

  it("updates number format from the submenu without closing edit property", async () => {
    const user = setupSubmenuUser();
    const onChange = vi.fn();
    renderInsideDropdown(<FormatMenu format="number" onUpdate={onChange} />);

    await user.hover(screen.getByRole("menuitem", { name: /Number format/i }));
    await user.click(
      await screen.findByRole("menuitemcheckbox", { name: "Currency" }),
    );

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("currency");
    expect(
      screen.getByRole("menuitem", { name: /Number format/i }),
    ).toBeInTheDocument();
  });
});

describe("RoundingMenu", () => {
  it("opens decimal places as a submenu", async () => {
    const user = setupSubmenuUser();
    renderInsideDropdown(<RoundingMenu round="default" onUpdate={vi.fn()} />);

    const roundingTrigger = screen.getByRole("menuitem", {
      name: /Decimal places/i,
    });
    expect(roundingTrigger).toHaveTextContent("Default");
    expect(
      screen.queryByRole("menuitemcheckbox", { name: "2" }),
    ).not.toBeInTheDocument();

    await user.hover(roundingTrigger);

    expect(
      await screen.findByRole("menuitemcheckbox", { name: "2" }),
    ).toBeInTheDocument();
  });

  it("updates decimal places from the submenu without closing edit property", async () => {
    const user = setupSubmenuUser();
    const onChange = vi.fn();
    renderInsideDropdown(<RoundingMenu round="default" onUpdate={onChange} />);

    await user.hover(screen.getByRole("menuitem", { name: /Decimal places/i }));
    await user.click(await screen.findByRole("menuitemcheckbox", { name: "2" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("2");
    await waitFor(() =>
      expect(
        screen.getByRole("menuitem", { name: /Decimal places/i }),
      ).toBeInTheDocument(),
    );
  });
});
