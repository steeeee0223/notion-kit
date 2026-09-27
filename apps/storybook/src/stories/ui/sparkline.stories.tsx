import type { Meta, StoryObj } from "storybook-react-rsbuild";

import SparklineDefault from "@notion-kit/registry/sparkline-default";

const meta = {
  title: "Dashboard/Sparkline",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <SparklineDefault />,
};
