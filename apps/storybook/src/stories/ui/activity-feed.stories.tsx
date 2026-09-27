import type { Meta, StoryObj } from "storybook-react-rsbuild";

import ActivityFeedDefault from "@notion-kit/registry/activity-feed-default";

const meta = {
  title: "Dashboard/ActivityFeed",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ActivityFeedDefault />,
};
