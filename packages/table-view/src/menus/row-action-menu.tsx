"use client";

import { useHotkeys } from "react-hotkeys-hook";

import { useCopyToClipboard } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import type { IconData } from "@notion-kit/ui/icon-block";
import { IconMenu } from "@notion-kit/ui/icon-menu";
import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteContent,
  AutocompleteGroup,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
  AutocompleteSeparator,
  MenuItem,
  MenuItemShortcut,
} from "@notion-kit/ui/primitives";
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
  const { copy } = useCopyToClipboard();
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

  /** Keyboard shortcut */
  useHotkeys("meta+shift+enter", openInNewTab, { preventDefault: true });
  useHotkeys("meta+d", duplicateRow, { preventDefault: true });
  useHotkeys("backspace", deleteRow);

  return (
    <Autocomplete
      items={actions}
      itemToStringValue={(action) => action.name}
      open
      autoHighlight="always"
      openOnInputClick
    >
      <AutocompleteInput placeholder="Search actions..." />
      <AutocompleteContent role="presentation" variant="inline">
        <AutocompleteList>
          <AutocompleteGroup>
            <AutocompleteLabel title="Page" />
            <IconMenu
              className="w-full border-none text-start hover:bg-transparent"
              onSelect={selectIcon}
              onRemove={removeIcon}
              onUpload={uploadIcon}
            >
              <AutocompleteItem
                icon={<Icon.EmojiFace className="size-5" />}
                label="Edit icon"
              />
            </IconMenu>
          </AutocompleteGroup>
          <AutocompleteSeparator />
          <AutocompleteGroup>
            <AutocompleteCollection>
              {(action: (typeof actions)[number]) => (
                <AutocompleteItem
                  key={action.value}
                  value={action}
                  icon={action.icon}
                  label={action.name}
                  onClick={action.onSelect}
                >
                  {action.shortcut && (
                    <MenuItemShortcut>{action.shortcut}</MenuItemShortcut>
                  )}
                </AutocompleteItem>
              )}
            </AutocompleteCollection>
          </AutocompleteGroup>
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  );
}
