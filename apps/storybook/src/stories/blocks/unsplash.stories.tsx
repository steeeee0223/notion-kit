import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { toast } from "@notion-kit/ui/primitives";
import { Unsplash } from "@notion-kit/ui/unsplash";

const meta = {
  title: "blocks/Unsplash",
  component: Unsplash,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Unsplash>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    apiKey: "UNSPLASH_ACCESS_KEY",
    onSelect: (image) =>
      toast.success(`Select: ${image.description ?? image.id}`),
  },
};
