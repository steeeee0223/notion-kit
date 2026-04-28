import type { Meta, StoryObj } from "storybook-react-rsbuild";

import Sidebar from "@notion-kit/registry/sidebar-basic";
import Sidebar2 from "@notion-kit/registry/sidebar-notion";

const meta = {
  title: "registry/Sidebar",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const BasicSidebar: Story = {
  render: () => <Sidebar />,
};
export const NotionSidebar: Story = {
  render: () => <Sidebar2 />,
};
