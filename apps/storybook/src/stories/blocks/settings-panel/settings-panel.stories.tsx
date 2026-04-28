import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SettingsDemo from "@notion-kit/registry/settings-panel-notion";

const meta = {
  title: "blocks/Settings Panel/Tabs",
  component: SettingsDemo,
  parameters: { layout: "centered" },
} satisfies Meta<typeof SettingsDemo>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Account */
export const Default: Story = {
  args: { tab: "account" },
};
export const Preferences: Story = {
  args: { tab: "preferences" },
};
export const Notifications: Story = {
  args: { tab: "notifications" },
};
export const MyConnections: Story = {
  args: { tab: "my-connections" },
};
/** Workspace */
export const Workspace: Story = {
  args: { tab: "general" },
};
export const People: Story = {
  args: { tab: "people" },
};
/** Features */
export const Emoji: Story = {
  args: { tab: "emoji" },
};
/** Admin */
export const Teamspaces: Story = {
  args: { tab: "teamspaces" },
};
export const Security: Story = {
  args: { tab: "security" },
};
export const Identity: Story = {
  args: { tab: "identity" },
};
/** Billing */
export const Billing: Story = {
  args: { tab: "billing" },
};
export const Plans: Story = {
  args: { tab: "plans" },
};
