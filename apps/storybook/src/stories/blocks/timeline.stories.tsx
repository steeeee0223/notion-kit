import type { Meta, StoryObj } from "storybook-react-rsbuild";

import TimelineLayout from "@notion-kit/registry/timeline-layout";
import TimelineWithSidebar from "@notion-kit/registry/timeline-with-sidebar";
import TimelineWithoutSidebar from "@notion-kit/registry/timeline-without-sidebar";

const meta = {
  title: "blocks/Timeline",
  parameters: { layout: "centered" },
  decorators: (Story) => (
    <div className="h-[calc(100dvh-4rem)] w-[calc(100dvw-4rem)]">
      <Story />
    </div>
  ),
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Layout: Story = {
  render: () => <TimelineLayout />,
};

export const Example: Story = {
  render: () => <TimelineWithoutSidebar />,
};

export const WithSidebar: Story = {
  render: () => <TimelineWithSidebar />,
};
