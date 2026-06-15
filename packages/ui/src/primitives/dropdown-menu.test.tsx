import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

describe("DropdownMenu", () => {
  it("composes the trigger with the Base UI render prop", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger render={<button type="button">Open</button>} />
        <DropdownMenuContent>
          <DropdownMenuItem label="Profile" />
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.getByRole("button", { name: "Open" })).toBeVisible();
    expect(
      screen.getByRole("menuitem", { name: "Profile" }),
    ).toBeInTheDocument();
  });
});
