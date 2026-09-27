import type { Meta, StoryObj } from "storybook-react-rsbuild";

import TodoStackDefault from "@notion-kit/registry/todo-stack-default";
import TodoStackEmpty from "@notion-kit/registry/todo-stack-empty";

const meta = {
  title: "Dashboard/TodoStack",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <TodoStackDefault />,
};

export const Empty: Story = {
  render: () => <TodoStackEmpty />,
};
