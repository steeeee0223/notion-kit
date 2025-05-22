import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "@notion-kit/shadcn";

const meta = {
  title: "Shadcn/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
export const Small: Story = {
  args: { size: "sm" },
};

export const ExtraSmall: Story = {
  args: { size: "xs" },
};
