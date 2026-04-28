import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import NavbarDemo from "@notion-kit/registry/navbar-notion";

const meta = {
  title: "blocks/Navbar",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  render: () => <NavbarDemo />,
};
