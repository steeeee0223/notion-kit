import type { Meta, StoryObj } from "storybook-react-rsbuild";

import PageHeaderDefault from "@notion-kit/registry/page-header-default";

const meta = {
  title: "Dashboard/PageHeader",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <PageHeaderDefault />,
};
