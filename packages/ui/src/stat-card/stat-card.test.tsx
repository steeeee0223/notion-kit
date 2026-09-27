import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { StatCard } from "./stat-card";

describe("StatCard", () => {
  it("StatCard_NumberValueWithFormat_RendersFormattedString", () => {
    render(
      <StatCard
        label="Monthly revenue"
        value={128400}
        format={(value) => `$${(value / 1000).toFixed(1)}k`}
      />,
    );

    expect(screen.getByText("$128.4k")).toBeInTheDocument();
  });

  it("StatCard_ReactNodeValue_RendersItDirectly", () => {
    render(<StatCard label="Status" value={<em>Healthy</em>} />);

    expect(screen.getByText("Healthy").tagName).toBe("EM");
  });

  it.each([
    { direction: "up" as const, positiveIsGood: true, expected: "text-green" },
    { direction: "up" as const, positiveIsGood: false, expected: "text-red" },
    { direction: "down" as const, positiveIsGood: true, expected: "text-red" },
    { direction: "flat" as const, positiveIsGood: true, expected: "text-muted" },
  ])(
    "StatCard_Delta_$direction_PositiveIsGood_$positiveIsGood_ColorsAccordingly",
    ({ direction, positiveIsGood, expected }) => {
      render(
        <StatCard
          label="Churn"
          value={12}
          delta={{ value: "4%", direction, positiveIsGood }}
        />,
      );

      expect(screen.getByText("4%").closest("span")).toHaveClass(expected);
    },
  );

  it("StatCard_Loading_ShowsSkeletonInsteadOfValue", () => {
    render(<StatCard label="Monthly revenue" value={128400} loading />);

    expect(screen.queryByText("128400")).not.toBeInTheDocument();
  });

  it("StatCard_Href_RendersAsLink", () => {
    render(<StatCard label="Monthly revenue" value={128400} href="/revenue" />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/revenue");
  });

  it("StatCard_OnClick_RendersAsButtonAndInvokesHandler", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<StatCard label="Monthly revenue" value={128400} onClick={onClick} />);

    await user.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
