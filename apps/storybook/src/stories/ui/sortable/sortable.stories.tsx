import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { SortableKanbanBoard } from "./sortable-kanban-board";
import { SortableMenuList } from "./sortable-menu-list";

const meta = {
  title: "Notion UI/Sortable",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const SortableList: Story = {
  render: () => <SortableMenuList />,
};

export const SortableSidebarList: Story = {
  render: () => <SortableMenuList itemHandle />,
};

export const KanbanBoard: Story = {
  render: () => <SortableKanbanBoard />,
};
