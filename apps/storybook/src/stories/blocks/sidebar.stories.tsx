import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { SidebarDemo } from "@notion-kit/sidebar";

const meta = {
  title: "blocks/Sidebar",
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <SidebarDemo
      onOpenSettings={fn}
      workspace={{
        name: "",
        icon: {
          type: "text",
          src: "",
        },
      }}
    />
  ),
};
