import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DndTree as DndTreeDemo } from "./dnd-tree";

const meta = {
  title: "shadcn/Tree",
  parameters: { layout: "centered" },
  argTypes: {
    renderItem: { control: false },
    selectedId: { type: "string" },
  },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const DndTree: Story = {
  render: () => <DndTreeDemo />,
};
