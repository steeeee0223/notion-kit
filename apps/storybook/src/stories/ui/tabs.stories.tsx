import type { Meta, StoryObj } from "storybook-react-rsbuild";

import TabsDemo from "@notion-kit/registry/tabs-demo";

const meta = {
  title: "Shadcn/Tabs",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <TabsDemo />,
};
