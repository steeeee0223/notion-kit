import type { Meta, StoryObj } from "@storybook/react";

import { NavbarDemo } from "./demo";

const meta = {
  title: "blocks/Navbar",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  render: () => <NavbarDemo />,
};
