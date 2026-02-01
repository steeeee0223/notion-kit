"use client";

import { useHotkeys } from "react-hotkeys-hook";

import { useCopyToClipboard, useFilter } from "@notion-kit/hooks";
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
import { KEYBOARD } from "@notion-kit/utils";

import { ROW_VIEW_OPTIONS } from "../features";
import { useTableViewCtx } from "../table-contexts";

interface RowActionMenuProps {
  rowId: string;
}

/**
 * @summary The actions of a row
 *
 * 1. ✅ Edit icon
 * 2. 🚧 Edit property
 * ---
 * 3. ✅ Open in
 * ---
 * 4. ✅ Copy link
 * 5. ✅ Duplicate
 * 6. 🚧 Move to
 * 7. ✅ Delete
 * ---
 * 8. 🚧 Comment
 */
export function RowActionMenu({ rowId }: RowActionMenuProps) {
  const { table } = useTableViewCtx();
  // 1. Edit icon
  const selectIcon = (icon: IconData) => {
    table.updateRowIcon(rowId, icon);
  };
  const removeIcon = () => {
    table.updateRowIcon(rowId, null);
  };
  const uploadIcon = (file: File) => {
    table.updateRowIcon(rowId, {
      type: "url",
      src: URL.createObjectURL(file),
    });
  };
  // 3. Open in
  const { rowView } = table.getTableGlobalState();
  const openRowView = () => table.openRow(rowId);
  const openInNewTab = () => table.openRowInTab(rowId);
  // 4. Copy link
  const [, copy] = useCopyToClipboard();
  const copyLink = () => {
    const url = table.getRowUrl(rowId);
    const link =
      typeof window !== "undefined" ? window.location.origin + url : "#";
    void copy(link);
  };
  // 5. Duplicate
  const duplicateRow = () => table.duplicateRow(rowId);
  // 7. Delete
  const deleteRow = () => table.deleteRow(rowId);

  /** Search */
  const actions = [
    {
      value: `open-in-${rowView}`,
      name: ROW_VIEW_OPTIONS[rowView].tooltip,
      icon: <Icon.ArrowDiagonalUpRight />,
      // shortcut: `${KEYBOARD.OPTION}Click`,
      onSelect: openRowView,
    },
    {
      value: "open-in-new-tab",
      name: "Open in new tab",
      icon: <Icon.ArrowDiagonalUpRight />,
      shortcut: `${KEYBOARD.CMD}${KEYBOARD.SHIFT}${KEYBOARD.ENTER}`,
      onSelect: openInNewTab,
    },
    {
      value: "copy-link",
      name: "Copy link",
      icon: <Icon.Link />,
      onSelect: copyLink,
    },
    {
      value: "duplicate",
      name: "Duplicate",
      icon: <Icon.Duplicate />,
      shortcut: `${KEYBOARD.CMD}D`,
      onSelect: duplicateRow,
    },
    {
      value: "delete",
      name: "Delete",
      icon: <Icon.Trash />,
      shortcut: KEYBOARD.DEL,
      onSelect: deleteRow,
    },
  ];
  const { search, results, updateSearch } = useFilter(actions, (prop, v) =>
    prop.value.includes(v),
  );

  /** Keyboard shortcut */
  useHotkeys("meta+shift+enter", openInNewTab, { preventDefault: true });
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
            <CommandItem
              asChild
              key={prop.value}
              value={prop.value}
              onSelect={prop.onSelect}
            >
              <MenuItem Icon={prop.icon} Body={prop.name}>
                {prop.shortcut && (
                  <MenuItemShortcut>{prop.shortcut}</MenuItemShortcut>
                )}
              </MenuItem>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
