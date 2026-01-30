import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  mockData,
  mockProperties,
  mockResizeObserver,
} from "../__tests__/mock";
import { TableView } from "../table-contexts";

mockResizeObserver();

function renderToolbar() {
  return render(<TableView properties={mockProperties} data={mockData} />);
}

describe("Toolbar", () => {
  describe("Sort Button", () => {
    it("should show the sort menu when clicking the sort button", async () => {
      const user = userEvent.setup();
      renderToolbar();

      // Find and click the Sort button
      const sortButton = screen.getByRole("button", { name: "Sort" });
      expect(sortButton).toBeInTheDocument();

      await user.click(sortButton);

      // SortMenu contains "Add sort" and "Delete sort" menu items
      expect(
        screen.getByRole("menuitem", { name: "Add sort" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("menuitem", { name: "Delete sort" }),
      ).toBeInTheDocument();
    });

    it("should close the sort menu when clicking outside", async () => {
      const user = userEvent.setup();
      renderToolbar();

      // Open the sort menu
      const sortButton = screen.getByRole("button", { name: "Sort" });
      await user.click(sortButton);

      // Verify menu is open
      const addSortButton = screen.getByRole("menuitem", { name: "Add sort" });
      expect(addSortButton).toBeInTheDocument();

      // Click outside (on the body)
      await user.click(document.body);

      // Menu should be closed
      expect(addSortButton).not.toBeInTheDocument();
    });
  });

  describe("Settings Button", () => {
    it("should show the table menu when clicking the settings button", async () => {
      const user = userEvent.setup();
      renderToolbar();

      // Find and click the Settings button
      const settingsButton = screen.getByRole("button", { name: "Settings" });
      expect(settingsButton).toBeInTheDocument();

      await user.click(settingsButton);

      // TableViewMenu shows "View Settings" header
      expect(
        screen.getByRole("heading", { name: "View Settings" }),
      ).toBeInTheDocument();
    });

    it("should close the settings menu when clicking outside", async () => {
      const user = userEvent.setup();
      renderToolbar();

      // Open the settings menu
      const settingsButton = screen.getByRole("button", { name: "Settings" });
      await user.click(settingsButton);

      // Verify menu is open
      expect(
        screen.getByRole("heading", { name: "View Settings" }),
      ).toBeInTheDocument();

      // Click outside (on the body)
      await user.click(document.body);

      // Menu should be closed
      expect(
        screen.queryByRole("heading", { name: "View Settings" }),
      ).not.toBeInTheDocument();
    });

    it("should toggle menu state correctly", async () => {
      const user = userEvent.setup();
      renderToolbar();

      const settingsButton = screen.getByRole("button", { name: "Settings" });

      // First click: open
      await user.click(settingsButton);
      expect(
        screen.getByRole("heading", { name: "View Settings" }),
      ).toBeInTheDocument();

      // Second click: close
      await user.click(settingsButton);
      expect(
        screen.queryByRole("heading", { name: "View Settings" }),
      ).not.toBeInTheDocument();

      // Third click: re-open
      await user.click(settingsButton);
      expect(
        screen.getByRole("heading", { name: "View Settings" }),
      ).toBeInTheDocument();
    });
  });
});
