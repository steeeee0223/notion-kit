import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  CommandCollection,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command";

describe("CommandDialog", () => {
  it("renders an accessible command palette dialog", () => {
    render(
      <CommandDialog open title="Workspace command palette">
        <CommandInput aria-label="Search commands" placeholder="Search..." />
        <CommandList>
          <CommandGroup heading="Actions">
            <CommandItem value="archive" label="Archive">
              <CommandShortcut>⌘A</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>,
    );

    expect(
      screen.getByRole("dialog", { name: "Workspace command palette" }),
    ).toBeInTheDocument();
    expect(
      screen
        .getByText("Workspace command palette")
        .closest("[data-slot='dialog-header']"),
    ).toHaveClass("sr-only");
    expect(
      screen.getByRole("combobox", { name: "Search commands" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Archive" })).toBeInTheDocument();
  });

  it("filters commands through autocomplete internals", async () => {
    const user = userEvent.setup();

    render(
      <CommandDialog open items={["archive", "duplicate"]}>
        <CommandInput aria-label="Search commands" />
        <CommandList>
          <CommandGroup heading="Actions">
            <CommandCollection>
              {(item: string) => (
                <CommandItem
                  key={item}
                  value={item}
                  label={item === "archive" ? "Archive" : "Duplicate"}
                />
              )}
            </CommandCollection>
          </CommandGroup>
        </CommandList>
        <CommandEmpty>No commands</CommandEmpty>
      </CommandDialog>,
    );

    await user.type(
      screen.getByRole("combobox", { name: "Search commands" }),
      "archive",
    );

    expect(screen.getByRole("option", { name: "Archive" })).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Duplicate" }),
    ).not.toBeInTheDocument();
  });

  it("filters object-valued commands through itemToStringValue", async () => {
    const user = userEvent.setup();
    const actions = [
      { id: "archive", title: "Archive page" },
      { id: "invite", title: "Invite members" },
    ];

    render(
      <CommandDialog
        open
        items={actions}
        itemToStringValue={(action) => action.title}
      >
        <CommandInput aria-label="Search commands" />
        <CommandList>
          <CommandGroup heading="Actions">
            <CommandCollection>
              {(action: (typeof actions)[number]) => (
                <CommandItem
                  key={action.id}
                  value={action}
                  label={action.title}
                />
              )}
            </CommandCollection>
          </CommandGroup>
        </CommandList>
        <CommandEmpty>No commands</CommandEmpty>
      </CommandDialog>,
    );

    await user.type(
      screen.getByRole("combobox", { name: "Search commands" }),
      "archive",
    );

    expect(
      screen.getByRole("option", { name: "Archive page" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Invite members" }),
    ).not.toBeInTheDocument();
  });

  it("activates command items", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <CommandDialog open>
        <CommandInput aria-label="Search commands" />
        <CommandList>
          <CommandGroup heading="Actions">
            <CommandItem value="archive" label="Archive" onClick={onSelect} />
          </CommandGroup>
        </CommandList>
      </CommandDialog>,
    );

    await user.click(screen.getByRole("option", { name: "Archive" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("renders separators through the autocomplete-backed command surface", () => {
    render(
      <CommandDialog open>
        <CommandInput aria-label="Search commands" />
        <CommandList>
          <CommandGroup heading="Actions">
            <CommandItem value="archive" label="Archive" />
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Danger">
            <CommandItem value="delete" label="Delete" />
          </CommandGroup>
        </CommandList>
      </CommandDialog>,
    );

    expect(screen.getByRole("separator")).toHaveAttribute(
      "data-slot",
      "command-separator",
    );
  });
});
