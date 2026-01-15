import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandSub,
  CommandSubContent,
  CommandSubTrigger,
} from "@notion-kit/shadcn";

// Test component with both inline and floating sub-menus
function CommandSubTest() {
  return (
    <Command className="w-[450px] rounded-lg border shadow-md">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Inline Sub-Menus">
          <CommandItem>📅 Calendar</CommandItem>

          <CommandSub>
            <CommandSubTrigger>⚙️ Settings (Inline)</CommandSubTrigger>
            <CommandSubContent variant="inline">
              <CommandItem>👤 Profile</CommandItem>
              <CommandItem>💳 Billing</CommandItem>
              <CommandItem>🔔 Notifications</CommandItem>
            </CommandSubContent>
          </CommandSub>

          <CommandItem>🔍 Search</CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Floating Sub-Menus">
          <CommandSub>
            <CommandSubTrigger>📁 Workspace (Floating)</CommandSubTrigger>
            <CommandSubContent variant="floating">
              <CommandItem>📄 New Page</CommandItem>
              <CommandItem>📋 Templates</CommandItem>

              {/* Nested floating sub-menu */}
              <CommandSub>
                <CommandSubTrigger>📤 Import</CommandSubTrigger>
                <CommandSubContent variant="floating">
                  <CommandItem>📝 Markdown</CommandItem>
                  <CommandItem>📊 CSV</CommandItem>
                  <CommandItem>📄 Word</CommandItem>
                </CommandSubContent>
              </CommandSub>
            </CommandSubContent>
          </CommandSub>

          <CommandSub>
            <CommandSubTrigger>👥 Team (Floating)</CommandSubTrigger>
            <CommandSubContent variant="floating">
              <CommandItem>➕ Invite User</CommandItem>
              <CommandItem>👨‍👩‍👧‍👦 Manage Members</CommandItem>
            </CommandSubContent>
          </CommandSub>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

const meta = {
  title: "Shadcn/Command/Tests",
  component: Command,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Test 1: Click to open/close inline sub-menu
 */
export const ClickInlineSubMenu: Story = {
  render: () => <CommandSubTest />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the inline settings trigger
    const settingsTrigger = canvas.getByText(/Settings \(Inline\)/i);

    // Initially, sub-content should not be visible
    expect(canvas.queryByText("👤 Profile")).not.toBeInTheDocument();

    // Click to open
    await userEvent.click(settingsTrigger);

    // Sub-content should now be visible
    await waitFor(() => {
      expect(canvas.getByText("👤 Profile")).toBeInTheDocument();
    });

    // Click again to close
    await userEvent.click(settingsTrigger);

    // Sub-content should be hidden
    await waitFor(() => {
      expect(canvas.queryByText("👤 Profile")).not.toBeInTheDocument();
    });
  },
};

/**
 * Test 2: Click to open/close floating sub-menu
 */
export const ClickFloatingSubMenu: Story = {
  render: () => <CommandSubTest />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the floating workspace trigger
    const workspaceTrigger = canvas.getByText(/Workspace \(Floating\)/i);

    // Initially, sub-content should not be visible
    expect(canvas.queryByText("📄 New Page")).not.toBeInTheDocument();

    // Click to open
    await userEvent.click(workspaceTrigger);

    // Sub-content should now be visible
    await waitFor(() => {
      expect(canvas.getByText("📄 New Page")).toBeInTheDocument();
    });

    // Click again to close
    await userEvent.click(workspaceTrigger);

    // Sub-content should be hidden
    await waitFor(() => {
      expect(canvas.queryByText("📄 New Page")).not.toBeInTheDocument();
    });
  },
};

/**
 * Test 3: Only one floating sub-menu open at a time
 */
export const FloatingSiblingCoordination: Story = {
  render: () => <CommandSubTest />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const workspaceTrigger = canvas.getByText(/Workspace \(Floating\)/i);
    const teamTrigger = canvas.getByText(/Team \(Floating\)/i);

    // Open workspace sub-menu
    await userEvent.click(workspaceTrigger);
    await waitFor(() => {
      expect(canvas.getByText("📄 New Page")).toBeInTheDocument();
    });

    // Open team sub-menu - workspace should auto-close
    await userEvent.click(teamTrigger);
    await waitFor(() => {
      expect(canvas.getByText("➕ Invite User")).toBeInTheDocument();
    });

    // Workspace content should be gone
    await waitFor(() => {
      expect(canvas.queryByText("📄 New Page")).not.toBeInTheDocument();
    });
  },
};

/**
 * Test 4: Keyboard navigation - ArrowDown to select trigger
 */
export const KeyboardNavigateToTrigger: Story = {
  render: () => <CommandSubTest />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText(/Type a command or search.../i);

    // Focus input
    input.focus();

    // Press ArrowDown multiple times to navigate to the Settings trigger
    await userEvent.keyboard("{ArrowDown}"); // Calendar
    await userEvent.keyboard("{ArrowDown}"); // Settings (Inline)

    // Check that Settings trigger has aria-selected="true"
    await waitFor(() => {
      const settingsTrigger = canvas.getByText(/Settings \(Inline\)/i);
      const item = settingsTrigger.closest("[cmdk-item]");
      expect(item).toHaveAttribute("aria-selected", "true");
    });
  },
};

/**
 * Test 5: Keyboard navigation - ArrowRight to open sub-menu
 */
export const KeyboardOpenSubMenu: Story = {
  render: () => <CommandSubTest />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText(/Type a command or search.../i);

    // Focus input and navigate to Settings trigger
    input.focus();
    await userEvent.keyboard("{ArrowDown}"); // Calendar
    await userEvent.keyboard("{ArrowDown}"); // Settings (Inline)

    // Verify we're on the Settings trigger
    await waitFor(() => {
      const settingsTrigger = canvas.getByText(/Settings \(Inline\)/i);
      const item = settingsTrigger.closest("[cmdk-item]");
      expect(item).toHaveAttribute("aria-selected", "true");
    });

    // Press ArrowRight to open sub-menu
    await userEvent.keyboard("{ArrowRight}");

    // Sub-content should be visible
    await waitFor(
      () => {
        expect(canvas.getByText("👤 Profile")).toBeInTheDocument();
      },
      { timeout: 200 },
    );
  },
};

/**
 * Test 6: Keyboard navigation - Enter to open sub-menu
 */
export const KeyboardEnterOpenSubMenu: Story = {
  render: () => <CommandSubTest />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText(/Type a command or search.../i);

    // Focus input and navigate to Settings trigger
    input.focus();
    await userEvent.keyboard("{ArrowDown}"); // Calendar
    await userEvent.keyboard("{ArrowDown}"); // Settings (Inline)

    // Press Enter to open sub-menu
    await userEvent.keyboard("{Enter}");

    // Sub-content should be visible
    await waitFor(
      () => {
        expect(canvas.getByText("👤 Profile")).toBeInTheDocument();
      },
      { timeout: 200 },
    );
  },
};

/**
 * Test 7: Keyboard navigation - ArrowLeft to close sub-menu
 */
export const KeyboardCloseSubMenu: Story = {
  render: () => <CommandSubTest />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText(/Type a command or search.../i);

    // Open sub-menu first
    input.focus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    await waitFor(() => {
      expect(canvas.getByText("👤 Profile")).toBeInTheDocument();
    });

    // Now the focus should be inside the sub-content
    // Press ArrowLeft to close
    await userEvent.keyboard("{ArrowLeft}");

    // Sub-content should be hidden
    await waitFor(
      () => {
        expect(canvas.queryByText("👤 Profile")).not.toBeInTheDocument();
      },
      { timeout: 200 },
    );

    // Focus should return to input
    expect(document.activeElement).toBe(input);
  },
};

/**
 * Test 8: Keyboard navigation - Escape to close sub-menu
 */
export const KeyboardEscapeCloseSubMenu: Story = {
  render: () => <CommandSubTest />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText(/Type a command or search.../i);

    // Open sub-menu
    input.focus();
    await userEvent.keyboard("{Arrow Down}{ArrowDown}{Enter}");

    await waitFor(() => {
      expect(canvas.getByText("👤 Profile")).toBeInTheDocument();
    });

    // Press Escape to close
    await userEvent.keyboard("{Escape}");

    // Sub-content should be hidden
    await waitFor(
      () => {
        expect(canvas.queryByText("👤 Profile")).not.toBeInTheDocument();
      },
      { timeout: 200 },
    );
  },
};

/**
 * Test 9: Nested sub-menu navigation
 */
export const KeyboardNestedSubMenu: Story = {
  render: () => <CommandSubTest />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText(/Type a command or search.../i);

    // Navigate to Workspace (Floating) trigger
    input.focus();
    // Skip over inline group items to reach floating group
    for (let i = 0; i < 4; i++) {
      await userEvent.keyboard("{ArrowDown}");
    }

    // Open Workspace sub-menu
    await userEvent.keyboard("{Enter}");

    await waitFor(() => {
      expect(canvas.getByText("📄 New Page")).toBeInTheDocument();
    });

    // Navigate to Import trigger inside Workspace sub-menu
    await waitFor(() => {
      const importTrigger = canvas.getByText("📤 Import");
      expect(importTrigger).toBeInTheDocument();
    });

    // Note: Actual focus management in nested menus requires more complex testing
    // This verifies the nested structure renders correctly
  },
};

/**
 * Test 10: Data attributes are present
 */
export const DataAttributesPresent: Story = {
  render: () => <CommandSubTest />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Click to open a sub-menu
    const settingsTrigger = canvas.getByText(/Settings \(Inline\)/i);
    await userEvent.click(settingsTrigger);

    // Wait for sub-content to appear
    await waitFor(() => {
      expect(canvas.getByText("👤 Profile")).toBeInTheDocument();
    });

    // Check that trigger has correct data attributes
    const triggerItem = settingsTrigger.closest("[data-command-sub-trigger]");
    expect(triggerItem).toHaveAttribute("data-command-sub-trigger");
    expect(triggerItem).toHaveAttribute("data-sub-id");
    const subId = triggerItem?.getAttribute("data-sub-id");

    // Check that content has matching data attributes
    const profileItem = canvas.getByText("👤 Profile");
    const content = profileItem.closest("[data-command-sub-content]");
    expect(content).toHaveAttribute("data-command-sub-content");
    expect(content).toHaveAttribute("data-sub-id", subId);
  },
};
