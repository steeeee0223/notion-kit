import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { IconBlock } from "@notion-kit/ui/icon-block";

const meta = {
  title: "blocks/Icon Block",
  component: IconBlock,
} satisfies Meta<typeof IconBlock>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Emoji: Story = {
  args: {
    size: "md",
    icon: { type: "emoji", src: "🚀" },
  },
};
export const Lucide: Story = {
  args: {
    size: "md",
    icon: { type: "lucide", src: "badge-euro", color: "#3e9392" },
  },
};
export const ImageUrl: Story = {
  args: {
    size: "md",
    icon: { type: "url", src: "https://github.com/shadcn.png" },
  },
};
export const Text: Story = {
  args: {
    size: "md",
    icon: { type: "text", src: "John" },
  },
};
