import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Spinner } from "@notion-kit/shadcn";

const meta = {
  title: "shadcn/Spinner",
  component: Spinner,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Spinner>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Dashed: Story = {
  args: { variant: "dashed" },
};
