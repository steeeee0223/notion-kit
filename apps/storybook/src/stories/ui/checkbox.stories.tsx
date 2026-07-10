import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { Checkbox } from "@notion-kit/ui/primitives";

const meta = {
  title: "Shadcn/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    return (
      <div className="flex items-center gap-2">
        <Checkbox defaultChecked />
        <Checkbox indeterminate />
        <Checkbox />
      </div>
    );
  },
};
export const Small: Story = {
  args: { size: "sm" },
};

export const ExtraSmall: Story = {
  args: { size: "xs" },
};
