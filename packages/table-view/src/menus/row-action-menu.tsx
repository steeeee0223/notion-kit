"use client";

import { useLayoutEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { useFilter } from "@notion-kit/hooks";
import type { IconData } from "@notion-kit/icon-block";
import { IconMenu } from "@notion-kit/icon-menu";
import { Icon } from "@notion-kit/icons";
import {
  Input,
  MenuGroup,
  MenuItem,
  MenuItemShortcut,
  Separator,
  useMenu,
} from "@notion-kit/shadcn";

import { MenuGroupHeader } from "../common";
import { useTableActions } from "../table-contexts";

interface RowActionMenuProps {
  rowId: string;
}

/**
 * @summary The actions of a row
 *
 * 1. 🚧 Edit icon
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
  const { closeMenu } = useMenu();
  const { duplicate, remove, updateRowIcon } = useTableActions();
  // 1. Edit icon
  const selectIcon = (icon: IconData) => {
    updateRowIcon(rowId, icon);
    closeMenu();
  };
  const removeIcon = () => {
    updateRowIcon(rowId, null);
    closeMenu();
  };
  const uploadIcon = (file: File) => {
    updateRowIcon(rowId, {
      type: "url",
      src: URL.createObjectURL(file),
    });
    closeMenu();
  };
  // 5. Duplicate
  const duplicateRow = () => {
    duplicate(rowId, "row");
    closeMenu();
  };
  // 7. Delete
  const deleteRow = () => {
    remove(rowId, "row");
    closeMenu();
  };

  /** Search */
  const inputRef = useRef<HTMLInputElement>(null);
  const actions = ["edit-icon", "duplicate", "delete"];
  // TODO implement search
  const { search, updateSearch } = useFilter(actions, (prop, v) =>
    prop.includes(v),
  );

  useLayoutEffect(() => {
    inputRef.current?.focus();
  }, []);

  /** Keyboard shortcut */
  useHotkeys("meta+d", duplicateRow, { preventDefault: true });
  useHotkeys("backspace", deleteRow);

  return (
    <>
      <div className="flex min-w-0 flex-auto flex-col px-3 pt-3 pb-2">
        <Input
          ref={inputRef}
          value={search}
          onChange={(e) => updateSearch(e.target.value)}
          placeholder="Search actions..."
        />
      </div>
      <MenuGroup>
        <MenuGroupHeader title="Page" />
        <IconMenu
          className="w-full border-none text-start hover:bg-transparent"
          onSelect={selectIcon}
          onRemove={removeIcon}
          onUpload={uploadIcon}
        >
          <MenuItem
            Icon={
              <Icon.EmojiFace className="size-5 fill-[#32302c] dark:fill-icon" />
            }
            Body="Edit icon"
          />
        </IconMenu>
      </MenuGroup>
      <Separator />
      <MenuGroup>
        <MenuItem
          Icon={
            <Icon.Duplicate className="size-4 fill-[#32302c] dark:fill-icon" />
          }
          Body="Duplicate"
          onClick={duplicateRow}
        >
          <MenuItemShortcut>⌘D</MenuItemShortcut>
        </MenuItem>
        <MenuItem
          className="group/trash"
          Icon={
            <Icon.Trash className="size-4 fill-[#32302c] group-hover/trash:fill-red dark:fill-icon group-hover/trash:dark:fill-red" />
          }
          Body="Delete"
          variant="warning"
          onClick={deleteRow}
        >
          <MenuItemShortcut>Del</MenuItemShortcut>
        </MenuItem>
      </MenuGroup>
    </>
  );
}
