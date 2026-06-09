import type { Meta, StoryObj } from "storybook-react-rsbuild";

import CommandDialogDemo from "@notion-kit/registry/command-dialog";

const meta = {
  title: "Shadcn/Command",
  parameters: { layout: "centered" },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Dialog: Story = {
  render: () => <CommandDialogDemo />,
};
