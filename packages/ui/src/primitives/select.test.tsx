import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectPreset,
  SelectTrigger,
  SelectValue,
} from "./select";

describe("Select", () => {
  it("renders the selected value and open item list", () => {
    render(
      <Select defaultOpen value="editor">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="viewer" label="Viewer" />
            <SelectItem value="editor" label="Editor" />
          </SelectGroup>
        </SelectContent>
      </Select>,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("editor");
    expect(screen.getByRole("option", { name: "Viewer" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Editor" })).toBeInTheDocument();
  });

  it("does not apply removed popper/items-aligned sizing to the item list", () => {
    render(
      <Select defaultOpen value="on">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="on" label="On" />
          </SelectGroup>
        </SelectContent>
      </Select>,
    );

    const list = screen.getByRole("listbox");
    expect(list).toHaveAttribute("data-slot", "select-list");
    expect(list).not.toHaveClass(
      "h-(--anchor-height)",
      "min-w-(--anchor-width)",
    );
  });

  it("wraps preset options in a select group", async () => {
    const user = userEvent.setup();
    render(
      <SelectPreset<"on" | "off">
        value="on"
        options={{
          on: "On",
          off: "Off",
        }}
      />,
    );

    await user.click(screen.getByRole("combobox"));

    expect(screen.getByRole("group")).toHaveAttribute(
      "data-slot",
      "select-group",
    );
  });
});
