import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Sparkline } from "./sparkline";

describe("Sparkline", () => {
  it("Sparkline_Render_ExposesAriaLabelAsImageRole", () => {
    render(<Sparkline data={[1, 2, 3]} ariaLabel="Revenue trend, up 12%" />);

    expect(screen.getByRole("img", { name: "Revenue trend, up 12%" })).toBeInTheDocument();
  });

  it("Sparkline_Render_UsesNonScalingStrokeAndFillsContainerWidth", () => {
    render(<Sparkline data={[1, 5, 2]} ariaLabel="Trend" />);

    const svg = screen.getByRole("img", { name: "Trend" });
    expect(svg).toHaveAttribute("preserveAspectRatio", "none");
    const line = svg.querySelector("path");
    expect(line).toHaveAttribute("vector-effect", "non-scaling-stroke");
  });

  it("Sparkline_Area_RendersAFilledPathBehindTheLine", () => {
    render(<Sparkline data={[1, 5, 2]} ariaLabel="Trend" area />);

    const svg = screen.getByRole("img", { name: "Trend" });
    expect(svg.querySelectorAll("path")).toHaveLength(2);
  });

  it("Sparkline_HighlightLast_RendersACircleAtTheFinalPoint", () => {
    render(<Sparkline data={[1, 5, 2]} ariaLabel="Trend" highlightLast />);

    const svg = screen.getByRole("img", { name: "Trend" });
    expect(svg.querySelector("circle")).toBeInTheDocument();
  });

  it("Sparkline_EmptyData_RendersWithoutThrowing", () => {
    render(<Sparkline data={[]} ariaLabel="No data" />);

    expect(screen.getByRole("img", { name: "No data" })).toBeInTheDocument();
  });
});
