"use client";

import { useLayoutEffect, useRef } from "react";

import { useFilter } from "@notion-kit/hooks";
import { IconMenu } from "@notion-kit/icon-menu";
import { Icon } from "@notion-kit/icons";
import { Input, MenuGroup, MenuItem, Separator } from "@notion-kit/shadcn";

import { MenuGroupHeader } from "../common";
import { useTableActions } from "../table-contexts";
import { useMenuControl } from "./menu-control-context";

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
  const { closePopover } = useMenuControl();
  const { duplicate, remove } = useTableActions();
  // 5. Duplicate
  const duplicateRow = () => {
    duplicate(rowId, "row");
    closePopover();
  };
  // 7. Delete
  const deleteRow = () => {
    remove(rowId, "row");
    closePopover();
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
          disabled
          className="w-full border-none text-start hover:bg-transparent"
        >
          <MenuItem
            Icon={
              <Icon.EmojiFace className="size-5 fill-[#32302c] dark:fill-icon" />
            }
            Body="Edit icon"
            disabled
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
        />
        <MenuItem
          className="group/trash"
          Icon={
            <Icon.Trash className="size-4 fill-[#32302c] group-hover/trash:fill-red dark:fill-icon group-hover/trash:dark:fill-red" />
          }
          Body="Delete"
          variant="warning"
          onClick={deleteRow}
        />
      </MenuGroup>
    </>
  );
}
