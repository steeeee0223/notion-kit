import type { Meta, StoryObj } from "@storybook/react";

import { DropdownMenu } from "@notion-kit/shadcn";

import { DropdownMenuCheckboxes } from "./checkboxes";
import { DropdownMenuDemo } from "./default";
import { DropdownMenuRadioGroupDemo } from "./radio-group";

const meta = {
  title: "Shadcn/Dropdown Menu",
  component: DropdownMenu,
  parameters: { layout: "centered" },
} satisfies Meta<typeof DropdownMenu>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DropdownMenuDemo />,
};
export const Checkboxes: Story = {
  render: () => <DropdownMenuCheckboxes />,
};
export const RadioGroup: Story = {
  render: () => <DropdownMenuRadioGroupDemo />,
};
