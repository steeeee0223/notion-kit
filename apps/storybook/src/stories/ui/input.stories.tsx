import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";

import { Input } from "@notion-kit/shadcn";

const meta = {
  title: "Shadcn/Input",
  component: Input,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Input>;
export default meta;

type Story = StoryObj<typeof meta>;

const Controlled: Story["render"] = (props) => {
  const [value, setValue] = useState("");
  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onCancel={() => setValue("")}
    />
  );
};

export const Default: Story = {
  args: { placeholder: "Type your name" },
};
export const Search: Story = {
  args: { search: true, placeholder: "Search a website" },
};
export const WithClear: Story = {
  args: { clear: true, placeholder: "Search a website" },
  render: Controlled,
};
