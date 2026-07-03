import type { Meta, StoryObj } from "storybook-react-rsbuild";

import SortableList from "@notion-kit/registry/sortable-list";

const meta = {
  title: "Notion UI/Sortable",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = {
  render: () => <SortableList />,
};

export const ListWithItemHandle: Story = {
  render: () => <SortableList itemHandle />,
};
