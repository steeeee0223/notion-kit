import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ActivityFeed, ActivityItem } from "./activity-feed";

describe("ActivityFeed", () => {
  it("ActivityFeed_Items_RendersTitleDescriptionAndTimestamp", () => {
    render(
      <ActivityFeed>
        <ActivityItem
          title="Invoice captured"
          description="From the paired extension."
          timestamp="2m ago"
        />
      </ActivityFeed>,
    );

    expect(screen.getByText("Invoice captured")).toBeInTheDocument();
    expect(screen.getByText("From the paired extension.")).toBeInTheDocument();
    expect(screen.getByText("2m ago")).toBeInTheDocument();
  });

  it("ActivityFeed_LastItem_HidesTheConnectingLine", () => {
    render(
      <ActivityFeed>
        <ActivityItem title="First" />
        <ActivityItem title="Second" />
      </ActivityFeed>,
    );

    const items = screen.getAllByRole("listitem");
    expect(items[0]!.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    expect(
      items[1]!.querySelector('[aria-hidden="true"]'),
    ).not.toBeInTheDocument();
  });

  it("ActivityFeed_ExplicitIsLast_OverridesComputedValue", () => {
    render(
      <ActivityFeed>
        <ActivityItem title="First" isLast />
        <ActivityItem title="Second" />
      </ActivityFeed>,
    );

    const items = screen.getAllByRole("listitem");
    expect(
      items[0]!.querySelector('[aria-hidden="true"]'),
    ).not.toBeInTheDocument();
  });
});
