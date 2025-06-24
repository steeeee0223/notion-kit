import type { Meta, StoryObj } from "@storybook/react";

import { SessionsTable } from "@notion-kit/settings-panel";

import { mockSessions } from "./data";

const meta = {
  component: SessionsTable,
  title: "blocks/Settings Panel/Sessions Table",
  parameters: { layout: "centered" },
} satisfies Meta<typeof SessionsTable>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentSessionId: mockSessions[0]!.id,
    data: mockSessions,
  },
};
