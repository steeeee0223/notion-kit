import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Selectable } from "@notion-kit/selectable";

import { items } from "./constants";
import { SelectWithDraggableItems } from "./draggable";

const meta = {
  title: "Shadcn/Selectable",
  component: Selectable,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Selectable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: (args) => {
    return (
      <Selectable
        {...args}
        className="min-h-[500px] min-w-200 rounded-lg bg-popover p-6 shadow-sm"
      >
        <Selectable.Overlay className="rounded-sm border-2 border-blue bg-blue/10" />
        <Selectable.Group className="grid grid-cols-5 gap-4">
          {items.map((item) => (
            <Selectable.Item
              key={item.id}
              id={item.id}
              className="rounded-lg bg-default/10 p-4 text-sm font-medium transition-[background] data-[selected=true]:bg-blue/30 data-[selected=true]:shadow-notion data-[selecting=true]:bg-blue/15"
            >
              {item.label}
            </Selectable.Item>
          ))}
        </Selectable.Group>
      </Selectable>
    );
  },
};

export const SelectContain: Story = {
  args: { mode: "contain" },
  render: (args) => {
    return (
      <Selectable
        {...args}
        className="min-h-[500px] min-w-200 rounded-lg bg-popover p-6 shadow-sm"
      >
        <Selectable.Overlay className="rounded-sm border-2 border-blue bg-blue/10" />
        <Selectable.Group className="grid grid-cols-5 gap-4">
          {items.map((item) => (
            <Selectable.Item
              key={item.id}
              id={item.id}
              className="rounded-lg bg-default/10 p-4 text-sm font-medium transition-[background] data-[selected=true]:bg-blue/30 data-[selected=true]:shadow-notion data-[selecting=true]:bg-blue/15"
            >
              {item.label}
            </Selectable.Item>
          ))}
        </Selectable.Group>
      </Selectable>
    );
  },
};

export const MultiSelect: Story = {
  args: { multiple: true },
  render: (args) => {
    return (
      <Selectable
        {...args}
        className="min-h-[500px] min-w-200 rounded-lg bg-popover p-6 shadow-sm"
      >
        <Selectable.Overlay className="rounded-sm border-2 border-blue bg-blue/10" />
        <Selectable.Group className="grid grid-cols-5 gap-4">
          {items.map((item) => (
            <Selectable.Item
              key={item.id}
              id={item.id}
              className="rounded-lg bg-default/10 p-4 text-sm font-medium transition-[background] data-[selected=true]:bg-blue/30 data-[selected=true]:shadow-notion data-[selecting=true]:bg-blue/15"
            >
              {item.label}
            </Selectable.Item>
          ))}
        </Selectable.Group>
      </Selectable>
    );
  },
};

export const NoOverlay: Story = {
  render: (args) => {
    return (
      <Selectable
        {...args}
        className="min-h-[500px] min-w-200 rounded-lg bg-popover p-6 shadow-sm"
      >
        <Selectable.Group className="grid grid-cols-5 gap-4">
          {items.map((item) => (
            <Selectable.Item
              key={item.id}
              id={item.id}
              className="rounded-lg bg-default/10 p-4 text-sm font-medium transition-[background] data-[selected=true]:bg-blue/30 data-[selected=true]:shadow-notion data-[selecting=true]:bg-blue/15"
            >
              {item.label}
            </Selectable.Item>
          ))}
        </Selectable.Group>
      </Selectable>
    );
  },
};

export const WithDraggableItems: Story = {
  args: {
    activationConstraint: { distance: 5, delay: 250 },
  },
  render: (args) => <SelectWithDraggableItems {...args} />,
};
