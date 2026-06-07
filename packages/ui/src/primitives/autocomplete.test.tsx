import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
  AutocompleteSeparator,
} from "./autocomplete";

const groups = [
  {
    value: "Pages",
    items: ["Getting Started", "Components"],
  },
  {
    value: "Actions",
    items: ["Invite Members", "Archive Page"],
  },
];

describe("Autocomplete", () => {
  it("renders grouped items with menu visuals", () => {
    render(
      <Autocomplete items={groups} defaultOpen openOnInputClick>
        <AutocompleteInput aria-label="Search workspace" />
        <AutocompleteContent variant="inline">
          <AutocompleteList>
            {(group: (typeof groups)[number]) => (
              <AutocompleteGroup key={group.value} items={group.items}>
                <AutocompleteLabel title={group.value} />
                <AutocompleteCollection>
                  {(item: string) => (
                    <AutocompleteItem key={item} value={item} label={item} />
                  )}
                </AutocompleteCollection>
              </AutocompleteGroup>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>,
    );

    expect(
      screen.getByRole("combobox", { name: "Search workspace" }),
    ).toHaveAttribute("data-slot", "autocomplete-input");
    expect(screen.getAllByRole("group")).toHaveLength(2);
    expect(screen.getByText("Pages").closest("[data-slot]")).toHaveAttribute(
      "data-slot",
      "autocomplete-label",
    );
    expect(
      screen.getByRole("option", { name: "Components" }),
    ).toHaveAttribute("data-slot", "autocomplete-item");
  });

  it("shows empty state through Base UI filtering", async () => {
    const user = userEvent.setup();

    render(
      <Autocomplete items={groups} defaultOpen openOnInputClick>
        <AutocompleteInput aria-label="Search workspace" />
        <AutocompleteContent variant="inline">
          <AutocompleteEmpty>No matches</AutocompleteEmpty>
          <AutocompleteList>
            {(group: (typeof groups)[number]) => (
              <AutocompleteGroup key={group.value} items={group.items}>
                <AutocompleteLabel title={group.value} />
                <AutocompleteCollection>
                  {(item: string) => (
                    <AutocompleteItem key={item} value={item} label={item} />
                  )}
                </AutocompleteCollection>
              </AutocompleteGroup>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>,
    );

    await user.type(
      screen.getByRole("combobox", { name: "Search workspace" }),
      "zzzzz",
    );

    expect(screen.getByText("No matches")).toBeVisible();
  });

  it("activates an item with keyboard selection", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <Autocomplete items={["Archive Page"]} defaultOpen autoHighlight="always">
        <AutocompleteInput aria-label="Search actions" />
        <AutocompleteContent variant="inline">
          <AutocompleteList>
            <AutocompleteGroup>
              <AutocompleteItem
                value="Archive Page"
                label="Archive Page"
                onClick={onSelect}
              />
            </AutocompleteGroup>
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>,
    );

    await user.click(screen.getByRole("combobox", { name: "Search actions" }));
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("renders separators with the shared separator slot", () => {
    render(
      <Autocomplete items={["Archive Page"]} defaultOpen>
        <AutocompleteInput aria-label="Search actions" />
        <AutocompleteContent variant="inline">
          <AutocompleteList>
            <AutocompleteGroup>
              <AutocompleteItem value="Archive Page" label="Archive Page" />
            </AutocompleteGroup>
            <AutocompleteSeparator />
            <AutocompleteGroup>
              <AutocompleteItem value="Delete Page" label="Delete Page" />
            </AutocompleteGroup>
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>,
    );

    const separator = screen.getByRole("separator");
    expect(separator).toHaveAttribute("data-slot", "autocomplete-separator");
  });

  it("keeps items inside an autocomplete group", () => {
    render(
      <Autocomplete items={["Archive Page"]} defaultOpen>
        <AutocompleteInput aria-label="Search actions" />
        <AutocompleteContent variant="inline">
          <AutocompleteList>
            <AutocompleteGroup>
              <AutocompleteItem value="Archive Page" label="Archive Page" />
            </AutocompleteGroup>
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>,
    );

    const group = screen.getByRole("group");
    expect(
      within(group).getByRole("option", { name: "Archive Page" }),
    ).toBeInTheDocument();
  });
});
