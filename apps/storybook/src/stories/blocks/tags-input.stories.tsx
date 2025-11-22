import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";

import { TagsInput } from "@notion-kit/tags-input";

const meta = {
  title: "blocks/Tags Input",
  component: TagsInput,
} satisfies Meta<typeof TagsInput>;
export default meta;

type Story = StoryObj<typeof TagsInput>;

const Template: Story["render"] = (args) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [input, setInput] = useState("");
  return (
    <TagsInput
      {...args}
      value={{ tags: emails, input }}
      onTagsChange={setEmails}
      onInputChange={setInput}
    />
  );
};

export const Default: Story = {
  args: {
    placeholder: "Search name or emails",
  },
  render: Template,
};
