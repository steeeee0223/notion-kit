import type { Meta, StoryObj } from "storybook-react-rsbuild";

import SidebarTrashBox from "@notion-kit/registry/sidebar-trash-box";

const meta = {
  title: "registry/Sidebar/Blocks",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const TrashBox: Story = {
  render: () => <SidebarTrashBox />,
};
