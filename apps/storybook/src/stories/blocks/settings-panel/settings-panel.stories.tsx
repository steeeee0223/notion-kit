import type { Meta, StoryObj } from "@storybook/react";

import { Demo as SettingsDemo } from "./demo";

const meta = {
  title: "blocks/Settings Panel",
  parameters: { layout: "centered" },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  render: () => <SettingsDemo />,
};
