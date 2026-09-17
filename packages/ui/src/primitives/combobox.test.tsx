import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, expectTypeOf, it, vi } from "vitest";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "./combobox";

const users = [
  { id: "user-1", name: "Ada" },
  { id: "user-2", name: "Grace" },
];
type User = (typeof users)[number];

describe("Combobox", () => {
  it("filters records by label and returns their IDs", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const items = Combobox.createItems(users, {
      getValue: (item) => item.id,
      getLabel: (item) => item.name,
    });

    render(
      <Combobox
        items={items}
        defaultValue="user-1"
        onValueChange={(value) => {
          expectTypeOf(value).toEqualTypeOf<string | null>();
          onValueChange(value);
        }}
      >
        <ComboboxInput aria-label="User" />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxGroup>
              <ComboboxCollection>
                {(item: User) => (
                  <ComboboxItem
                    key={item.id}
                    value={item.id}
                    label={item.name}
                  />
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    );

    const input = screen.getByRole("combobox", { name: "User" });
    expect(input).toHaveValue("Ada");
    await user.clear(input);
    await user.type(input, "Gra");
    expect(
      screen.queryByRole("option", { name: "Ada" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "Grace" }));

    expect(input).toHaveValue("Grace");
    expect(onValueChange).toHaveBeenLastCalledWith("user-2");
  });

  it("keeps grouped selections by ID when records are replaced and chips are removed", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    function Picker({ records }: { records: User[] }) {
      const groups = [{ label: "Users", items: records }];
      const items = Combobox.createItems(groups, {
        getValue: (item: User) => item.id,
        getLabel: (item) => item.name,
      });
      return (
        <Combobox<string, true, User>
          multiple
          items={items}
          defaultValue={["user-1", "user-2"]}
          onValueChange={onValueChange}
        >
          <ComboboxChips>
            <ComboboxValue>
              {(selected: string[]) => (
                <>
                  {selected.map((id) => (
                    <ComboboxChip key={id}>
                      {records.find((item) => item.id === id)?.name}
                    </ComboboxChip>
                  ))}
                  <ComboboxChipsInput aria-label="Users" />
                </>
              )}
            </ComboboxValue>
          </ComboboxChips>
          <ComboboxContent>
            <ComboboxList>
              {(group: { label: string; items: User[] }) => (
                <ComboboxGroup key={group.label} items={group.items}>
                  <ComboboxCollection>
                    {(item: User) => (
                      <ComboboxItem
                        key={item.id}
                        value={item.id}
                        label={item.name}
                      />
                    )}
                  </ComboboxCollection>
                </ComboboxGroup>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      );
    }

    const { rerender } = render(<Picker records={users} />);
    rerender(<Picker records={users.map((item) => ({ ...item }))} />);
    await user.click(screen.getByRole("combobox", { name: "Users" }));
    expect(screen.getByRole("option", { name: "Ada" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await user.keyboard("{Escape}");
    await user.click(screen.getAllByRole("button", { name: "Remove" })[0]!);

    expect(onValueChange).toHaveBeenLastCalledWith(
      ["user-2"],
      expect.anything(),
    );
  });
});
