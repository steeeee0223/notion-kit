import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageHeader } from "./page-header";

describe("PageHeader", () => {
  it("PageHeader_Default_RendersTitleAsHeading1", () => {
    render(<PageHeader title="Overview" />);

    expect(screen.getByRole("heading", { level: 1, name: "Overview" })).toBeInTheDocument();
  });

  it("PageHeader_As_RendersTitleWithTheGivenTag", () => {
    render(<PageHeader title="Overview" as="h2" />);

    expect(screen.getByRole("heading", { level: 2, name: "Overview" })).toBeInTheDocument();
  });

  it("PageHeader_BreadcrumbDescriptionActionsMeta_RendersAllSlots", () => {
    render(
      <PageHeader
        title="Overview"
        breadcrumb={<span>Home / Overview</span>}
        description="A summary of this workspace."
        actions={<button type="button">New</button>}
        meta={<span>Last updated today</span>}
      />,
    );

    expect(screen.getByText("Home / Overview")).toBeInTheDocument();
    expect(screen.getByText("A summary of this workspace.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument();
    expect(screen.getByText("Last updated today")).toBeInTheDocument();
  });
});
