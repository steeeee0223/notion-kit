import type { Meta, StoryObj } from "storybook-react-rsbuild";

import EmptyStateDefault from "@notion-kit/registry/empty-state-default";

const meta = {
  title: "Dashboard/EmptyState",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <EmptyStateDefault />,
};
