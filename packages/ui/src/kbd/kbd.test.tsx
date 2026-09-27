import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Kbd, KbdGroup } from "./kbd";

describe("Kbd", () => {
  it("Kbd_Render_UsesTheKbdElement", () => {
    render(<Kbd>K</Kbd>);

    expect(screen.getByText("K").tagName).toBe("KBD");
  });

  it("KbdGroup_Render_GroupsMultipleKbdChips", () => {
    render(
      <KbdGroup aria-label="Command K">
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>,
    );

    const group = screen.getByRole("group", { name: "Command K" });
    expect(group.querySelectorAll("kbd")).toHaveLength(2);
  });
});
