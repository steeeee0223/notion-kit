import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

describe("DropdownMenu indicators", () => {
  it("DropdownMenuRadioItem_ChangeSelection_RemovesPreviousCheckmarks", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Options</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup defaultValue="Green">
            {["Brown", "Orange", "Yellow", "Green"].map((color) => (
              <DropdownMenuRadioItem
                key={color}
                value={color}
                label={color}
                closeOnClick={false}
              />
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const menu = screen.getByRole("menu");

    for (const color of ["Brown", "Orange", "Yellow", "Green"]) {
      const selected = within(menu).getByRole("menuitemradio", { name: color });
      await user.click(selected);

      expect(selected).toBeChecked();
      await waitFor(() => {
        expect(menu.querySelectorAll("svg")).toHaveLength(1);
      });
      expect(selected.querySelector("svg")).toBeVisible();
    }
  });

  it("DropdownMenuCheckboxItem_Uncheck_RemovesCheckmark", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Options</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuCheckboxItem
              label="Show completed"
              defaultChecked
              closeOnClick={false}
            />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const item = screen.getByRole("menuitemcheckbox", {
      name: "Show completed",
    });
    await waitFor(() => expect(item.querySelector("svg")).toBeVisible());

    await user.click(item);

    expect(item).not.toBeChecked();
    await waitFor(() => {
      expect(item.querySelector("svg")).not.toBeInTheDocument();
    });
  });
});
