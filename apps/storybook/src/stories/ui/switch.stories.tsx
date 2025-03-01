import type { Meta, StoryObj } from "@storybook/react";

import { Switch } from "@notion-kit/shadcn";

const meta = {
  title: "Shadcn/Switch",
  component: Switch,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {},
};
export const Small: Story = {
  args: { size: "sm" },
};
