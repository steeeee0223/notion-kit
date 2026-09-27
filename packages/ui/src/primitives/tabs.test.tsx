import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

describe("Tabs variant", () => {
  it("TabsList_NoVariant_DefaultsToLineAndKeepsExistingStyling", () => {
    render(
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Content</TabsContent>
      </Tabs>,
    );

    expect(screen.getByRole("tablist")).toHaveAttribute("data-variant", "line");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "data-variant",
      "line",
    );
  });

  it("TabsList_Segmented_MarksListAndTriggersWithTheSegmentedVariant", () => {
    render(
      <Tabs defaultValue="overview">
        <TabsList variant="segmented">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview content</TabsContent>
        <TabsContent value="activity">Activity content</TabsContent>
      </Tabs>,
    );

    expect(screen.getByRole("tablist")).toHaveAttribute("data-variant", "segmented");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "data-variant",
      "segmented",
    );
  });

  it("TabsList_Segmented_StillSwitchesTheActiveTab", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="overview">
        <TabsList variant="segmented">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview content</TabsContent>
        <TabsContent value="activity">Activity content</TabsContent>
      </Tabs>,
    );

    await user.click(screen.getByRole("tab", { name: "Activity" }));

    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute(
      "data-active",
      "",
    );
  });
});
