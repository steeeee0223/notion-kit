import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  Badge,
  MenuItem,
  MultiSelect,
  TooltipPreset,
  TooltipProvider,
  type MultiSelectOption,
} from "@notion-kit/shadcn";

const frameworks: MultiSelectOption[] = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
    disabled: true,
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
  {
    value: "angular",
    label: "Angular",
  },
  {
    value: "vue",
    label: "Vue.js",
  },
  {
    value: "react",
    label: "React",
  },
  {
    value: "ember",
    label: "Ember.js",
  },
  {
    value: "gatsby",
    label: "Gatsby",
  },
  {
    value: "eleventy",
    label: "Eleventy",
    disabled: true,
  },
  {
    value: "solid",
    label: "SolidJS",
  },
  {
    value: "preact",
    label: "Preact",
  },
  {
    value: "qwik",
    label: "Qwik",
  },
  {
    value: "alpine",
    label: "Alpine.js",
  },
  {
    value: "lit",
    label: "Lit",
  },
];

const meta = {
  title: "Shadcn/Multi-Select",
  component: MultiSelect,
  parameters: { layout: "centered" },
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    commandProps: {
      label: "Select frameworks",
    },
    className: "w-80",
    value: frameworks.slice(0, 2),
    defaultOptions: frameworks,
    placeholder: "Select frameworks",
    hidePlaceholderWhenSelected: true,
    emptyIndicator: <p className="text-center text-sm">No results found</p>,
  },
};

const selectOptions: MultiSelectOption[] = [
  {
    value: "Option A",
    label: "Option A",
    color: "rgba(227,226,224,0.5)",
    group: "Group",
  },
  {
    value: "Option B",
    label: "Option B",
    color: "rgba(255,226,221,0.5)",
    group: "Group",
  },
  {
    value: "Option C",
    label: "Option C",
    color: "rgba(253,236,200,0.5)",
    group: "Group",
  },
  {
    value: "Option D",
    label: "Option D",
    color: "rgba(219,237,219,0.5)",
    group: "Group",
  },
];

export const Inline: Story = {
  args: {
    variant: "inline",
    className: "w-70",
    value: [],
    groupBy: "group",
    defaultOptions: selectOptions,
    placeholder: "Search for an option...",
    hidePlaceholderWhenSelected: true,
    hideClearAllButton: true,
    selectFirstItem: false,
    creatable: true,
    renderOption: ({ option }) => (
      <MenuItem
        Body={
          <Badge variant="tag" style={{ backgroundColor: option.color }}>
            {option.label}
          </Badge>
        }
      />
    ),
  },
};
