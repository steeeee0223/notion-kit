import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Demo as SettingsDemo } from "./demo";

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
/** Admin */
export const Teamspaces: Story = {
  args: { tab: "teamspaces" },
};
/** Billing */
export const Plans: Story = {
  args: { tab: "plans" },
};
export const Billing: Story = {
  args: { tab: "billing" },
};
