import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import type { SelectProps } from "@notion-kit/select";
import { Select } from "@notion-kit/select";

const meta = {
  title: "blocks/Select",
  component: Select,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Select>;
export default meta;

type Story = StoryObj<typeof meta>;

const Template: Story["render"] = ({ value, ...props }) => {
  const [currentValue, setCurrentValue] = useState(value);
  return <Select {...props} value={currentValue} onChange={setCurrentValue} />;
};

export const Default: Story = {
  args: {
    options: {
      on: "On",
      off: "Off",
    },
    value: "on",
  },
  render: Template,
};

const Custom: SelectProps["renderOption"] = ({ option }) => (
  <div className="truncate text-secondary">
    {typeof option === "string" ? option : option?.label}
  </div>
);

export const CustomDisplay: Story = {
  args: {
    options: {
      on: { label: "On", description: "Turn on notification" },
      off: { label: "Off", description: "Turn on notification" },
    },
    value: "on",
    renderOption: Custom,
  },
  render: Template,
};
