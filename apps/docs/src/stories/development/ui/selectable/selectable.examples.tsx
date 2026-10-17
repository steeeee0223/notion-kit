import type { ComponentProps } from "react";

import { Selectable } from "@notion-kit/ui/selectable";

import { items } from "./constants";
import { SelectWithDraggableItems } from "./draggable";

export function BasicExample() {
  const args = {} satisfies Partial<ComponentProps<typeof Selectable>>;

  return (
    <Selectable
      {...args}
      className="min-h-125 min-w-200 rounded-lg bg-popover p-6 shadow-sm"
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
}

interface SelectContainProps {
  mode?: ComponentProps<typeof Selectable>["mode"];
}
export function SelectContainExample(overrides: SelectContainProps) {
  const args = { mode: "contain", ...overrides } satisfies Partial<
    ComponentProps<typeof Selectable>
  >;

  return (
    <Selectable
      {...args}
      className="min-h-125 min-w-200 rounded-lg bg-popover p-6 shadow-sm"
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
}

interface MultiSelectProps {
  multiple?: ComponentProps<typeof Selectable>["multiple"];
}
export function MultiSelectExample(overrides: MultiSelectProps) {
  const args = { multiple: true, ...overrides } satisfies Partial<
    ComponentProps<typeof Selectable>
  >;

  return (
    <Selectable
      {...args}
      className="min-h-125 min-w-200 rounded-lg bg-popover p-6 shadow-sm"
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
}

export function NoOverlayExample() {
  const args = {} satisfies Partial<ComponentProps<typeof Selectable>>;

  return (
    <Selectable
      {...args}
      className="min-h-125 min-w-200 rounded-lg bg-popover p-6 shadow-sm"
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
}

export function WithDraggableItemsExample() {
  const args = {
    activationConstraint: { distance: 5, delay: 250 },
  } satisfies Partial<ComponentProps<typeof Selectable>>;
  return <SelectWithDraggableItems {...args} />;
}
