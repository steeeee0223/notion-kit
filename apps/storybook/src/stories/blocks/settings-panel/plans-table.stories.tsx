import type { Meta, StoryObj } from "@storybook/react";

import { PlansTable } from "@notion-kit/settings-panel";

const meta = {
  component: PlansTable,
  title: "blocks/Settings Panel/Plans Table",
  parameters: { layout: "centered" },
} satisfies Meta<typeof PlansTable>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
