import type { Meta, StoryObj } from "storybook-react-rsbuild";

import StatCardDefault from "@notion-kit/registry/stat-card-default";
import StatCardInteractive from "@notion-kit/registry/stat-card-interactive";
import StatCardLoading from "@notion-kit/registry/stat-card-loading";
import StatCardWithChart from "@notion-kit/registry/stat-card-with-chart";

const meta = {
  title: "Dashboard/StatCard",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <StatCardDefault />,
};

export const WithChart: Story = {
  render: () => <StatCardWithChart />,
};

export const Loading: Story = {
  render: () => <StatCardLoading />,
};

export const Interactive: Story = {
  render: () => <StatCardInteractive />,
};
