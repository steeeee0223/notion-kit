import type { Meta, StoryObj } from "@storybook/react";

import { IconBlock } from "@notion-kit/icon-block";

const meta = {
  title: "blocks/Icon Block",
  component: IconBlock,
  tags: ["autodocs"],
} satisfies Meta<typeof IconBlock>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Emoji: Story = {
  args: {
    size: "md",
    icon: { type: "emoji", emoji: "🚀" },
  },
};
export const Lucide: Story = {
  args: {
    size: "md",
    icon: { type: "lucide", name: "badge-euro", color: "#3e9392" },
  },
};
export const ImageUrl: Story = {
  args: {
    size: "md",
    icon: { type: "file", url: "https://github.com/shadcn.png" },
  },
};
export const Text: Story = {
  args: {
    size: "md",
    icon: { type: "text", text: "John" },
  },
};
