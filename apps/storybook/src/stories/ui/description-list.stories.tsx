import type { Meta, StoryObj } from "storybook-react-rsbuild";

import DescriptionListDefault from "@notion-kit/registry/description-list-default";

const meta = {
  title: "Dashboard/DescriptionList",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DescriptionListDefault />,
};
