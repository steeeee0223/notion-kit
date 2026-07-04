import type { Meta, StoryObj } from "storybook-react-rsbuild";

import SelectCustom from "@notion-kit/registry/select-custom";
import SelectDefault from "@notion-kit/registry/select-default";

const meta = {
  title: "shadcn/Select",
  parameters: { layout: "centered" },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <SelectDefault />,
};

export const CustomDisplay: Story = {
  render: () => <SelectCustom />,
};
