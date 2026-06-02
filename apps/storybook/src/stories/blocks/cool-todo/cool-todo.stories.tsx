import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { CoolTodo } from "./cool-todo";

const meta = {
  title: "interesting/Cool Todo",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <CoolTodo />,
};
