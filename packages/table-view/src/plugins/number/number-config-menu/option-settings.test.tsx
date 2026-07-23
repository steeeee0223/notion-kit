import { fireEvent, render, screen } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { NumberOptions } from "../types";
import { DisplayTypeSelect } from "./display-type-select";
import { OptionSettings } from "./option-settings";

const options: NumberOptions = {
  color: "green",
  divideBy: 100,
  showNumber: true,
};

function setupUser() {
  return userEvent.setup({
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  });
}

describe("DisplayTypeSelect", () => {
  it.each([
    ["Number", "number"],
    ["Bar", "bar"],
    ["Ring", "ring"],
  ] as const)(
    "DisplayTypeSelect_%sClick_ReportsSelectedDisplayType",
    async (label, type) => {
      const user = setupUser();
      const onUpdate = vi.fn();
      render(<DisplayTypeSelect type="number" onUpdate={onUpdate} />);

      await user.click(
        screen.getByRole("button", { name: new RegExp(`${label}$`) }),
      );

      expect(onUpdate).toHaveBeenCalledOnce();
      expect(onUpdate).toHaveBeenCalledWith(type);
    },
  );

  it("DisplayTypeSelect_CurrentType_ExposesOnlyThatButtonAsSelected", () => {
    render(<DisplayTypeSelect type="ring" onUpdate={vi.fn()} />);

    expect(screen.getByRole("button", { name: /Ring$/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("button", { name: /Number$/ })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });
});

describe("OptionSettings", () => {
  it("OptionSettings_ValidDivideByBlur_ReportsParsedNumber", () => {
    const onUpdate = vi.fn();
    render(<OptionSettings options={options} onUpdate={onUpdate} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "250.5" } });
    fireEvent.blur(input);

    expect(onUpdate).toHaveBeenCalledWith({ divideBy: 250.5 });
  });

  it("OptionSettings_InvalidDivideByBlur_PreservesPreviousNumber", () => {
    const onUpdate = vi.fn();
    render(<OptionSettings options={options} onUpdate={onUpdate} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "not a number" } });
    fireEvent.blur(input);

    expect(onUpdate).toHaveBeenCalledWith({ divideBy: 100 });
  });

  it("OptionSettings_ShowNumberToggle_ReportsNextBoolean", async () => {
    const user = setupUser();
    const onUpdate = vi.fn();
    render(<OptionSettings options={options} onUpdate={onUpdate} />);

    await user.click(screen.getByRole("switch"));

    expect(onUpdate).toHaveBeenCalledWith({ showNumber: false });
  });

  it("OptionSettings_ColorSelection_ReportsSelectedColor", async () => {
    const user = setupUser();
    const onUpdate = vi.fn();
    render(<OptionSettings options={options} onUpdate={onUpdate} />);

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "Blue" }));

    expect(onUpdate).toHaveBeenCalledWith({ color: "blue" });
  });
});
