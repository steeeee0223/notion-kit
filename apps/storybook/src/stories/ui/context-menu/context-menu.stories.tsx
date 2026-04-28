import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { ContextMenuExample } from "./example";

const meta = {
  title: "Shadcn/Context Menu",
  parameters: { layout: "centered" },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  render: () => <ContextMenuExample />,
};
