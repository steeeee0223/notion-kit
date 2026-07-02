import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { SortableMenuList } from "./sortable-menu-list";

const meta = {
  title: "Notion UI/Sortable",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = {
  render: () => <SortableMenuList />,
};

export const ListWithItemHandle: Story = {
  render: () => <SortableMenuList itemHandle />,
};
