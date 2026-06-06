import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./context-menu";

describe("ContextMenu", () => {
  it("composes the trigger with the Base UI render prop", () => {
    render(
      <ContextMenu open>
        <ContextMenuTrigger
          render={<button type="button">Open context menu</button>}
        />
        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuItem Body="Remove marker" />
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>,
    );

    expect(screen.getByText("Open context menu")).toBeVisible();
    expect(
      screen.getByRole("menuitem", { name: "Remove marker" }),
    ).toBeInTheDocument();
  });
});
