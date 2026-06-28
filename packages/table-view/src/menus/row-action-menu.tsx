import React from "react";
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
  MenuItemShortcut,
} from "@notion-kit/ui/primitives";
import { KEYBOARD } from "@notion-kit/utils";

import { ROW_VIEW_OPTIONS } from "@/features";
import { useTableViewCtx } from "@/table-contexts";

interface Action {
  value: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  onSelect?: () => void;
}
interface ActionGroup {
  value: string;
  items: Action[];
}

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
  const groups: ActionGroup[] = [
    {
      value: "Page",
      items: [
        {
          value: `edit-icon`,
          label: "Edit icon",
          icon: <Icon.EmojiFace className="size-5" />,
        },
      ],
    },
    {
      value: "Open in",
      items: [
        {
          value: `open-in-${rowView}`,
          label: ROW_VIEW_OPTIONS[rowView].tooltip,
          icon: <Icon.ArrowDiagonalUpRight />,
          // shortcut: `${KEYBOARD.OPTION}Click`,
          onSelect: openRowView,
        },
        {
          value: "open-in-new-tab",
          label: "Open in new tab",
          icon: <Icon.ArrowDiagonalUpRight />,
          shortcut: `${KEYBOARD.CMD}${KEYBOARD.SHIFT}${KEYBOARD.ENTER}`,
          onSelect: openInNewTab,
        },
      ],
    },
    {
      value: "Action",
      items: [
        {
          value: "copy-link",
          label: "Copy link",
          icon: <Icon.Link />,
          onSelect: copyLink,
        },
        {
          value: "duplicate",
          label: "Duplicate",
          icon: <Icon.Duplicate />,
          shortcut: `${KEYBOARD.CMD}D`,
          onSelect: duplicateRow,
        },
        {
          value: "delete",
          label: "Delete",
          icon: <Icon.Trash />,
          shortcut: KEYBOARD.DEL,
          onSelect: deleteRow,
        },
      ],
    },
  ];

  /** Keyboard shortcut */
  useHotkeys("meta+shift+enter", openInNewTab, { preventDefault: true });
  useHotkeys("meta+d", duplicateRow, { preventDefault: true });
  useHotkeys("backspace", deleteRow);

  return (
    <Autocomplete<Action>
      items={groups}
      itemToStringValue={(action) => action.value}
      open
      autoHighlight="always"
      openOnInputClick
    >
      <AutocompleteInput placeholder="Search actions..." />
      <AutocompleteContent role="presentation" variant="inline">
        <AutocompleteList>
          {(group: ActionGroup, index) => {
            const isLast = groups.length - 1 === index;

            return (
              <React.Fragment key={group.value}>
                <AutocompleteGroup key={group.value} items={group.items}>
                  {group.value === "Page" && (
                    <AutocompleteLabel title={group.value} />
                  )}
                  <AutocompleteCollection>
                    {({ shortcut, onSelect, ...action }: Action) => {
                      if (group.value === "Page") {
                        return (
                          <IconMenu
                            className="w-full border-none text-start hover:bg-transparent"
                            onSelect={selectIcon}
                            onRemove={removeIcon}
                            onUpload={uploadIcon}
                          >
                            <AutocompleteItem {...action} />
                          </IconMenu>
                        );
                      }

                      return (
                        <AutocompleteItem
                          key={action.value}
                          {...action}
                          onClick={onSelect}
                        >
                          {shortcut && (
                            <MenuItemShortcut>{shortcut}</MenuItemShortcut>
                          )}
                        </AutocompleteItem>
                      );
                    }}
                  </AutocompleteCollection>
                </AutocompleteGroup>
                {!isLast && <AutocompleteSeparator />}
              </React.Fragment>
            );
          }}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  );
}
