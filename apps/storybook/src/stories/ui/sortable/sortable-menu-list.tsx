import { useState } from "react";

import { Icon } from "@notion-kit/icons";
import { MenuGroup, MenuItem, Sortable } from "@notion-kit/ui/primitives";

const menuItems = [
  { id: "inbox", label: "Inbox", icon: <Icon.Globe /> },
  { id: "roadmap", label: "Roadmap", icon: <Icon.ViewBoard /> },
  { id: "archive", label: "Archive", icon: <Icon.Clock /> },
];

export function SortableMenuList({ itemHandle }: { itemHandle?: boolean }) {
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
            render={
              <MenuItem
                icon={
                  itemHandle ? (
                    item.icon
                  ) : (
                    <div>
                      <div className="size-5 group-hover/item:hidden">
                        {item.icon}
                      </div>
                      <Sortable.Handle className="hidden size-5 group-hover/item:flex" />
                    </div>
                  )
                }
                label={item.label}
              />
            }
          />
        ))}
      </Sortable.List>
    </Sortable.Root>
  );
}
