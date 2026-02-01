import { screen, within } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { mockResizeObserver } from "../__tests__/mock";
import { openSettingsMenu } from "../__tests__/utils";

mockResizeObserver();

async function openNewPropertyMenu(user: UserEvent) {
  const menu = await openSettingsMenu(user);

  // Click on "Edit properties" menu item
  const propsMenuItem = within(menu).getByRole("menuitem", {
    name: "Edit properties",
  });
  await user.click(propsMenuItem);

  expect(
    screen.getByRole("heading", { name: "Properties" }),
  ).toBeInTheDocument();

  const newPropertyItem = within(menu).getByRole("menuitem", {
    name: "New property",
  });
  await user.click(newPropertyItem);

  expect(
    screen.getByRole("heading", { name: "New property" }),
  ).toBeInTheDocument();

  return menu;
}

describe("TypesMenu", () => {
  it("should display 'New property' header and search placeholder", async () => {
    const user = userEvent.setup();
    await openNewPropertyMenu(user);

    expect(
      screen.getByRole("heading", { name: "New property" }),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search or add new property"),
    ).toBeInTheDocument();
  }, 10000);

  it("should display available property types", async () => {
    const user = userEvent.setup();
    const menu = await openNewPropertyMenu(user);

    // Should show common property types
    expect(within(menu).getByText("Text")).toBeInTheDocument();
    expect(within(menu).getByText("Number")).toBeInTheDocument();
    expect(within(menu).getByText("Checkbox")).toBeInTheDocument();
    expect(within(menu).getByText("Date")).toBeInTheDocument();
    expect(within(menu).getByText("Email")).toBeInTheDocument();
  });

  it("should navigate back to Properties menu when clicking back button", async () => {
    const user = userEvent.setup();
    const menu = await openNewPropertyMenu(user);

    // Click back button
    const backButton = within(menu).getByRole("button", { name: /back/i });
    await user.click(backButton);

    // Should return to Properties menu
    expect(
      screen.getByRole("heading", { name: "Properties" }),
    ).toBeInTheDocument();
  });

  it("should show 'Type' heading in the types list", async () => {
    const user = userEvent.setup();
    const menu = await openNewPropertyMenu(user);

    expect(within(menu).getByText("Type")).toBeInTheDocument();
  });
});
