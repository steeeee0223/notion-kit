import type { Meta, StoryObj } from "storybook-react-rsbuild";

import SidebarDemo from "@notion-kit/registry/sidebar-notion";

const meta = {
  title: "blocks/Sidebar",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  render: () => <SidebarDemo />,
};
