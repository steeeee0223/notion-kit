import type { Meta, StoryObj } from "storybook-react-rsbuild";

import DropdownMenuDemo from "@notion-kit/registry/dropdown-menu";
import DropdownMenuCheckboxes from "@notion-kit/registry/dropdown-menu-checkbox";

const meta = {
  title: "Shadcn/Dropdown Menu",
  parameters: { layout: "centered" },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  render: () => <DropdownMenuDemo />,
};
export const Checkboxes: Story = {
  render: () => <DropdownMenuCheckboxes />,
};
