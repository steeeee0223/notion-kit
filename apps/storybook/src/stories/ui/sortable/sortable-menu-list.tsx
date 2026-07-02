import { useState } from "react";

import { Icon } from "@notion-kit/icons";
import {
  getSortableItemsAfterDrag,
  MenuGroup,
  MenuItem,
  Sortable,
} from "@notion-kit/ui/primitives";

const menuItems = [
  { id: "inbox", label: "Inbox", icon: <Icon.Globe /> },
  { id: "roadmap", label: "Roadmap", icon: <Icon.ViewBoard /> },
  { id: "archive", label: "Archive", icon: <Icon.Clock /> },
];

export function SortableMenuList({ itemHandle }: { itemHandle?: boolean }) {
  const [items, setItems] = useState(menuItems);

  return (
    <Sortable.Root
      onDragEnd={(e) => setItems(getSortableItemsAfterDrag(items, e))}
    >
      <Sortable.List
        className="w-64 rounded-lg bg-popover shadow-sm"
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
