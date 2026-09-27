import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("EmptyState_Render_ShowsTitleAndDescription", () => {
    render(
      <EmptyState
        title="No invoices yet"
        description="Invoices you capture will show up here."
      />,
    );

    expect(screen.getByText("No invoices yet")).toBeInTheDocument();
    expect(
      screen.getByText("Invoices you capture will show up here."),
    ).toBeInTheDocument();
  });

  it("EmptyState_Actions_RendersProvidedControls", () => {
    render(
      <EmptyState
        title="No invoices yet"
        actions={<button type="button">Add invoice</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "Add invoice" })).toBeInTheDocument();
  });

  it.each(["sm", "md"] as const)(
    "EmptyState_Size_%s_RendersWithoutThrowing",
    (size) => {
      render(<EmptyState size={size} title="No invoices yet" />);

      expect(screen.getByText("No invoices yet")).toBeInTheDocument();
    },
  );
});
