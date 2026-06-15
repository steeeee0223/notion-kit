import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
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
});
