import type { Meta, StoryObj } from "storybook-react-rsbuild";

import AutocompleteDefault from "@notion-kit/registry/autocomplete-default";
import AutocompleteGridMenu from "@notion-kit/registry/autocomplete-grid-menu";
import AutocompletePopover from "@notion-kit/registry/autocomplete-popover";

const meta = {
  title: "Shadcn/Autocomplete",
  parameters: { layout: "centered" },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => <AutocompleteDefault />,
};

export const PopoverMenu: Story = {
  render: () => <AutocompletePopover />,
};

export const GridMenu: Story = {
  render: () => <AutocompleteGridMenu />,
};
