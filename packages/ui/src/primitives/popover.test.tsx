import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

describe("Popover", () => {
  it("keeps Base UI render composition available", () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger
          render={<button type="button">Render trigger</button>}
        />
        <PopoverContent>Rendered content</PopoverContent>
      </Popover>,
    );

    expect(
      screen.getByRole("button", { name: "Render trigger" }),
    ).toHaveAttribute("data-slot", "popover-trigger");
    expect(screen.getByText("Rendered content")).toBeInTheDocument();
  });

  it("supports the close button", async () => {
    const user = userEvent.setup();
    render(
      <Popover defaultOpen>
        <PopoverTrigger render={<button type="button">Open</button>} />
        <PopoverContent>
          <span>Closable content</span>
          <PopoverClose />
        </PopoverContent>
      </Popover>,
    );

    expect(screen.getByText("Closable content")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByText("Closable content")).not.toBeInTheDocument();
  });

  it("keeps Radix-style content compatibility props", () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger render={<button type="button">Open</button>} />
        <PopoverContent forceMount sticky="always">
          Sticky content
        </PopoverContent>
      </Popover>,
    );

    expect(screen.getByText("Sticky content")).toHaveAttribute(
      "data-slot",
      "popover-content",
    );
  });
});
