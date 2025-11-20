import type { Meta, StoryObj } from "@storybook/nextjs";

import { Spinner } from "@notion-kit/spinner";

const meta = {
  title: "blocks/Spinner",
  component: Spinner,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Spinner>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Dashed: Story = {
  args: { variant: "dashed" },
};
