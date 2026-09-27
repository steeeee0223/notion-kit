import type { Meta, StoryObj } from "storybook-react-rsbuild";

import KbdDefault from "@notion-kit/registry/kbd-default";

const meta = {
  title: "Dashboard/Kbd",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <KbdDefault />,
};
