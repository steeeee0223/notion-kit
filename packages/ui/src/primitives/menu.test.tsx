import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MenuItem, MenuLabel } from "./menu";

describe("menu primitives", () => {
  it("renders MenuItem and MenuLabel with the public label/icon/title API", () => {
    render(
      <div>
        <MenuLabel title="Actions" />
        <MenuItem label="Archive" icon={<span data-testid="archive-icon" />} />
      </div>,
    );

    expect(screen.getByText("Actions")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Archive" })).toBeVisible();
    expect(screen.getByTestId("archive-icon")).toBeInTheDocument();
  });
});
