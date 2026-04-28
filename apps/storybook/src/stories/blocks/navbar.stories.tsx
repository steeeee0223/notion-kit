import type { Meta, StoryObj } from "storybook-react-rsbuild";

import Navbar from "@notion-kit/registry/navbar-notion";

const meta = {
  title: "registry/Navbar",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const NotionNavbar: Story = {
  render: () => <Navbar />,
};
