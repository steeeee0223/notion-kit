import type { Meta, StoryObj } from "@storybook/nextjs";
import { ChevronRight, CircleHelp, RefreshCw } from "lucide-react";

import { Button } from "@notion-kit/shadcn";

const meta = {
  title: "Shadcn/Button",
  component: Button,
  parameters: { layout: "centered" },

  args: {
    size: "md",
  },
  argTypes: {
    disabled: { type: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: { children: "Notion style" },
};
export const Blue: Story = {
  args: { variant: "blue", children: "Upgrade" },
};
export const Warning: Story = {
  args: { variant: "red", children: "Delete this project" },
};
export const Hint: Story = {
  args: {
    variant: "hint",
    size: "xs",
    children: (
      <>
        <CircleHelp className="size-3.5" />
        Learn more about this feature
      </>
    ),
  },
};
export const Link: Story = {
  args: { variant: "link", children: "Link" },
};
export const Nav: Story = {
  args: {
    variant: "nav-icon",
    size: null,
    children: <ChevronRight />,
  },
};
export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <RefreshCw className="animate-spin" /> Please wait
      </>
    ),
  },
};
