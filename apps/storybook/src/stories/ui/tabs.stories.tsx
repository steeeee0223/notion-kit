import type { Meta, StoryObj } from "storybook-react-rsbuild";

import TabsDemo from "@notion-kit/registry/tabs-demo";
import TabsSegmented from "@notion-kit/registry/tabs-segmented";

const meta = {
  title: "Shadcn/Tabs",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <TabsDemo />,
};

export const Segmented: Story = {
  render: () => <TabsSegmented />,
};
