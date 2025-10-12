"use client";

import { useHotkeys } from "react-hotkeys-hook";

import { useFilter } from "@notion-kit/hooks";
import type { IconData } from "@notion-kit/icon-block";
import { IconMenu } from "@notion-kit/icon-menu";
import { Icon } from "@notion-kit/icons";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  MenuItem,
  MenuItemShortcut,
} from "@notion-kit/shadcn";

import { useTableActions } from "../table-contexts";

interface RowActionMenuProps {
  rowId: string;
}

/**
 * @summary The actions of a row
 *
 * 1. ✅ Edit icon
 * 2. 🚧 Edit property
 * ---
 * 3. 🚧 Open in
 * ---
 * 4. 🚧 Copy link
 * 5. ✅ Duplicate
 * 6. 🚧 Move to
 * 7. ✅ Delete
 * ---
 * 8. 🚧 Comment
 */
export function RowActionMenu({ rowId }: RowActionMenuProps) {
  const { duplicate, remove, updateRowIcon } = useTableActions();
  // 1. Edit icon
  const selectIcon = (icon: IconData) => {
    updateRowIcon(rowId, icon);
  };
  const removeIcon = () => {
    updateRowIcon(rowId, null);
  };
  const uploadIcon = (file: File) => {
    updateRowIcon(rowId, {
      type: "url",
      src: URL.createObjectURL(file),
    });
  };
  // 5. Duplicate
  const duplicateRow = () => duplicate(rowId, "row");
  // 7. Delete
  const deleteRow = () => remove(rowId, "row");

  /** Search */
  const actions = [
    {
      value: "duplicate",
      name: "Duplicate",
      icon: <Icon.Duplicate />,
      shortcut: "⌘D",
      onSelect: duplicateRow,
    },
    {
      value: "delete",
      name: "Delete",
      icon: <Icon.Trash />,
      shortcut: "Del",
      onSelect: deleteRow,
    },
  ];
  const { search, results, updateSearch } = useFilter(actions, (prop, v) =>
    prop.value.includes(v),
  );

  /** Keyboard shortcut */
  useHotkeys("meta+d", duplicateRow, { preventDefault: true });
  useHotkeys("backspace", deleteRow);

  return (
    <Command shouldFilter={false}>
      <CommandInput
        value={search}
        onValueChange={updateSearch}
        placeholder="Search actions..."
      />
      <CommandList>
        <CommandGroup heading="Page">
          <IconMenu
            className="w-full border-none text-start hover:bg-transparent"
            onSelect={selectIcon}
            onRemove={removeIcon}
            onUpload={uploadIcon}
          >
            <MenuItem
              Icon={<Icon.EmojiFace className="size-5" />}
              Body="Edit icon"
            />
          </IconMenu>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup>
          {results?.map((prop) => (
            <CommandItem asChild value={prop.value} onSelect={prop.onSelect}>
              <MenuItem Icon={prop.icon} Body={prop.name}>
                <MenuItemShortcut>{prop.shortcut}</MenuItemShortcut>
              </MenuItem>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
