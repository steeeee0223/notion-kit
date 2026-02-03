import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Command } from "@notion-kit/shadcn";

import { CommandDefault } from "./command/default";
import { CommandSubFloating } from "./command/floating";
import { CommandNested } from "./command/nested";
import { CommandSubDemo } from "./command/sub-menu";

const meta = {
  title: "Shadcn/Command",
  component: Command,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <CommandDefault />,
};

export const Nested: Story = {
  render: () => <CommandNested />,
};

export const SubMenu: Story = {
  render: () => <CommandSubDemo />,
};

export const FloatingSubMenu: Story = {
  render: () => <CommandSubFloating />,
};
