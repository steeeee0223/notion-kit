import type { Meta, StoryObj } from "storybook-react-rsbuild";

import ComboboxBasic from "@notion-kit/registry/combobox-basic";
import ComboboxMultipleFloating from "@notion-kit/registry/combobox-multiple-floating";
import ComboboxMultipleInline from "@notion-kit/registry/combobox-multiple-inline";

const meta = {
  title: "Shadcn/Combobox",
  parameters: { layout: "centered" },
  argTypes: {
    maxChips: {
      control: { type: "number", min: 1, max: 5, step: 1 },
    },
  },
} satisfies Meta;
export default meta;

type Story = StoryObj<{ maxChips: number }>;

export const Basic: Story = {
  render: () => <ComboboxBasic />,
};

export const MultipleFloating: Story = {
  args: { maxChips: 3 },
  render: ({ maxChips }) => <ComboboxMultipleFloating maxChips={maxChips} />,
};

export const MultipleInline: Story = {
  args: { maxChips: 3 },
  render: ({ maxChips }) => <ComboboxMultipleInline maxChips={maxChips} />,
};
