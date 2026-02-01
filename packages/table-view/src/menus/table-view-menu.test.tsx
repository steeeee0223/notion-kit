import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { mockResizeObserver } from "../__tests__/mock";
import { openSettingsMenu } from "../__tests__/utils";

mockResizeObserver();

describe("TableViewMenu", () => {
  describe("Navigation", () => {
    it("should navigate to Layout menu when clicking Layout", async () => {
      const user = userEvent.setup();
      const menu = await openSettingsMenu(user);

      // Click Layout menu item
      const layoutMenuItem = within(menu).getByRole("menuitem", {
        name: "Layout",
      });
      await user.click(layoutMenuItem);

      expect(
        screen.getByRole("heading", { name: "Layout" }),
      ).toBeInTheDocument();
      // Should show Layout menu with layout options
      expect(screen.getByText("Table")).toBeInTheDocument();
    });

    it("should navigate to Sort menu when clicking Sort", async () => {
      const user = userEvent.setup();
      const menu = await openSettingsMenu(user);

      // Click Sort menu item (within the popover content)
      const sortMenuItem = within(menu).getByRole("menuitem", { name: "Sort" });
      await user.click(sortMenuItem);

      // Should show Sort menu with "Sort" header
      expect(screen.getByRole("heading", { name: "Sort" })).toBeInTheDocument();
    });

    it("should navigate to Group menu when clicking Group", async () => {
      const user = userEvent.setup();
      const menu = await openSettingsMenu(user);

      // Click Group menu item
      const groupMenuItem = within(menu).getByRole("menuitem", {
        name: "Group",
      });
      await user.click(groupMenuItem);

      // Should show Group selection menu with "Group by" header
      expect(
        screen.getByRole("heading", { name: "Group by" }),
      ).toBeInTheDocument();
    });

    it("should navigate to Edit properties menu when clicking Edit properties", async () => {
      const user = userEvent.setup();
      const menu = await openSettingsMenu(user);

      // Click Edit properties menu item
      const editPropsMenuItem = within(menu).getByRole("menuitem", {
        name: "Edit properties",
      });
      await user.click(editPropsMenuItem);

      // Should show properties editing menu with property names
      // Look for property items in the props menu
      const nameMenuItem = within(menu).queryByRole("menuitem", {
        name: "Name",
      });
      const doneMenuItem = within(menu).queryByRole("menuitem", {
        name: "Done",
      });
      expect(nameMenuItem).toBeInTheDocument();
      expect(doneMenuItem).toBeInTheDocument();
    });
  });

  describe("Lock Database", () => {
    it("should toggle database lock state when clicking Lock database", async () => {
      const user = userEvent.setup();
      const menu = await openSettingsMenu(user);

      // Initially should show "Lock database"
      const lockMenuItem = within(menu).getByRole("menuitem", {
        name: "Lock database",
      });
      expect(lockMenuItem).toBeInTheDocument();

      // Click to lock - the menu stays open and updates immediately
      await user.click(lockMenuItem);

      // Should now show "Unlock database" (menu stays open)
      expect(
        within(menu).getByRole("menuitem", { name: "Unlock database" }),
      ).toBeInTheDocument();
    });

    it("should disable Edit properties when database is locked", async () => {
      const user = userEvent.setup();
      const menu = await openSettingsMenu(user);

      // Lock the database first - menu stays open
      const lockMenuItem = within(menu).getByRole("menuitem", {
        name: "Lock database",
      });
      await user.click(lockMenuItem);

      // Wait for menu to update
      expect(
        within(menu).getByRole("menuitem", { name: "Unlock database" }),
      ).toBeInTheDocument();

      // Edit properties should be disabled
      const editPropsMenuItem = within(menu).getByRole("menuitem", {
        name: "Edit properties",
      });
      expect(editPropsMenuItem.ariaDisabled).toBe("true");
    });
  });

  describe("Back Navigation", () => {
    it("should return to main menu when clicking back from Sort menu", async () => {
      const user = userEvent.setup();
      const menu = await openSettingsMenu(user);

      // Navigate to Sort menu
      const sortMenuItem = within(menu).getByRole("menuitem", { name: "Sort" });
      await user.click(sortMenuItem);

      // Wait for Sort menu
      expect(
        within(menu).getByRole("menuitem", { name: "Add sort" }),
      ).toBeInTheDocument();

      // Click back button
      const backButton = within(menu).getByRole("button", { name: /back/i });
      await user.click(backButton);

      // Should return to main menu with "View Settings"
      expect(
        screen.getByRole("heading", { name: "View Settings" }),
      ).toBeInTheDocument();
    });
  });
});
