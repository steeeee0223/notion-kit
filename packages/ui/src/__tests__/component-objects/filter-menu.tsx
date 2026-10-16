import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/primitives/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuEmpty,
  DropdownMenuFilter,
  DropdownMenuGroup,
  DropdownMenuInput,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuList,
  DropdownMenuTrigger,
} from "@/primitives/dropdown-menu";

export class FilterMenuObject {
  static async open(kind: "dropdown" | "context", onSelect: () => void) {
    const user = userEvent.setup();
    const Root = kind === "dropdown" ? DropdownMenu : ContextMenu;
    const Trigger =
      kind === "dropdown" ? DropdownMenuTrigger : ContextMenuTrigger;
    const Content =
      kind === "dropdown" ? DropdownMenuContent : ContextMenuContent;
    render(
      <DropdownMenuFilter>
        <Root>
          <Trigger render={<button type="button">Actions</button>} />
          <Content aria-label="Actions">
            <DropdownMenuInput aria-label="Search actions" />
            <DropdownMenuEmpty>No results</DropdownMenuEmpty>
            <DropdownMenuList>
              <DropdownMenuGroup>
                <DropdownMenuLabel title="Pages" />
                <DropdownMenuItem label="Archive" onClick={onSelect} />
              </DropdownMenuGroup>
              <DropdownMenuGroup>
                <DropdownMenuLabel title="Actions" />
                <DropdownMenuItem label="Duplicate" />
                <DropdownMenuItem label="Unavailable" disabled />
              </DropdownMenuGroup>
            </DropdownMenuList>
          </Content>
        </Root>
      </DropdownMenuFilter>,
    );
    const trigger = screen.getByText("Actions");
    await user.click(trigger);
    if (kind === "context")
      fireEvent.contextMenu(trigger, { clientX: 40, clientY: 20 });
    return new FilterMenuObject(
      user,
      await screen.findByRole("dialog", { name: "Actions" }),
      trigger,
    );
  }

  constructor(
    readonly user: ReturnType<typeof userEvent.setup>,
    readonly root: HTMLElement,
    readonly trigger: HTMLElement,
  ) {}
  input() {
    return within(this.root).getByRole<HTMLInputElement>("searchbox", {
      name: "Search actions",
    });
  }
  list() {
    return within(this.root).getByRole("menu");
  }
  item(name: string) {
    return within(this.list()).getByRole("menuitem", { name });
  }
  queryItem(name: string) {
    return within(this.list()).queryByRole("menuitem", { name });
  }
  queryGroup(name: string) {
    return within(this.list()).queryByRole("group", { name });
  }
  queryLabel(name: string) {
    return within(this.list()).queryByText(name, { exact: true });
  }
  empty() {
    return within(this.root).getByRole("status");
  }
  async search(query: string) {
    await this.user.type(this.input(), query);
  }
  // Base UI intentionally hides this pointer affordance from the accessibility tree.
  async clear() {
    await this.user.click(within(this.root).getByLabelText("Clear input"));
  }
}
