import type { Meta, StoryObj } from "storybook-react-rsbuild";

import TooltipDemo from "@notion-kit/registry/tooltip-demo";

const meta = {
  title: "Shadcn/Tooltip",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <TooltipDemo />,
};
