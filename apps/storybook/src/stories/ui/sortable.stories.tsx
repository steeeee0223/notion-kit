import { useState } from "react";
import type { Meta, StoryObj } from "storybook-react-rsbuild";
import { expect, within } from "storybook/test";

import { Icon } from "@notion-kit/icons";
import {
  MenuGroup,
  MenuItem,
  MenuItemAction,
  Sortable,
} from "@notion-kit/ui/primitives";

const meta = {
  title: "Notion UI/Sortable",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const menuItems = [
  { id: "inbox", label: "Inbox", icon: <Icon.Globe /> },
  { id: "roadmap", label: "Roadmap", icon: <Icon.ViewBoard /> },
  { id: "archive", label: "Archive", icon: <Icon.Clock /> },
];

const itemLabels = menuItems.map((item) => item.label);

function SortableMenuList({ itemHandle }: { itemHandle?: boolean }) {
  const [items, setItems] = useState(menuItems);

  return (
    <Sortable.Root
      items={items.map((item) => item.id)}
      onItemsChange={(orderedIds) => {
        const itemsById = new Map(items.map((item) => [item.id, item]));
        setItems(
          orderedIds.flatMap((id) => {
            const item = itemsById.get(String(id));
            return item ? [item] : [];
          }),
        );
      }}
    >
      <Sortable.List
        className="w-64 rounded-lg bg-popover p-1 shadow-sm"
        render={<MenuGroup />}
      >
        {items.map((item, index) => (
          <Sortable.Item
            key={item.id}
            id={item.id}
            index={index}
            className="rounded-sm"
            render={
              <MenuItem icon={item.icon} label={item.label}>
                {!itemHandle && (
                  <MenuItemAction>
                    <Sortable.Handle aria-label={`Move ${item.label}`} />
                  </MenuItemAction>
                )}
              </MenuItem>
            }
          />
        ))}
      </Sortable.List>
    </Sortable.Root>
  );
}

async function assertMenuItems(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);

  for (const label of itemLabels) {
    await expect(canvas.getByRole("menuitem", { name: label })).toBeVisible();
  }
}

export const SortableList: Story = {
  render: () => <SortableMenuList />,
  play: async ({ canvasElement }) => {
    await assertMenuItems(canvasElement);
    const canvas = within(canvasElement);

    for (const label of itemLabels) {
      await expect(
        canvas.getByRole("button", { name: `Move ${label}` }),
      ).toBeVisible();
    }
  },
};

export const SortableSidebarList: Story = {
  render: () => <SortableMenuList itemHandle />,
  play: async ({ canvasElement }) => {
    await assertMenuItems(canvasElement);
  },
};
