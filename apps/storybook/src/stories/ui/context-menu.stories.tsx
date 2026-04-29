import type { Meta, StoryObj } from "storybook-react-rsbuild";

import ContextMenuExample from "@notion-kit/registry/context-menu";

const meta = {
  title: "Shadcn/Context Menu",
  parameters: { layout: "centered" },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  render: () => <ContextMenuExample />,
};
