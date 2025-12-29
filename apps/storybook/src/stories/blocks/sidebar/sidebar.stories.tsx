import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SidebarDemo } from "./demo";

const meta = {
  title: "blocks/Sidebar",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  render: () => <SidebarDemo />,
};
