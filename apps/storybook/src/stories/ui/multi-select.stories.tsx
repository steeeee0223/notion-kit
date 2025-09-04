import type { Meta, StoryObj } from "@storybook/react";

import { MultiSelect, type MultiSelectOption } from "@notion-kit/shadcn";

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
    disable: true,
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
    disable: true,
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

export const Example: Story = {
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
