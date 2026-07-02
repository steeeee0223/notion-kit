import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { KanbanBoard } from "./kanban-board";

const meta = {
  title: "blocks/Kanban",
  parameters: { layout: "centered" },
  decorators: (Story) => (
    <div className="h-[calc(100dvh-4rem)] w-[calc(100dvw-4rem)]">
      <Story />
    </div>
  ),
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Kanban: Story = {
  render: () => <KanbanBoard />,
};
