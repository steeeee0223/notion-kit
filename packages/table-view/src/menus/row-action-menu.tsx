import React, { useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { useCopyToClipboard } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import { ROW_VIEW_OPTIONS } from "@notion-kit/table-hook";
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

import { useEditLog } from "@/edit-log/edit-log-provider";
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
  onClose?: () => void;
  getReturnFocus?: () => HTMLElement | null;
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
export function RowActionMenu({
  rowId,
  onClose,
  getReturnFocus,
}: RowActionMenuProps) {
  const { table } = useTableViewCtx();
  const { canViewRowLogs, openRowLog, isOpen } = useEditLog();
  const searchInputRef = useRef<HTMLInputElement>(null);
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
        ...(canViewRowLogs
          ? [
              {
                value: "edit-log",
                label: "Edit log",
                icon: <Icon.Clock />,
                onSelect: () => {
                  const row = table.getRow(rowId);
                  const titleColumn = row
                    .getAllCells()
                    .find((cell) => cell.column.getInfo().type === "title")
                    ?.column.id;
                  const title: unknown = titleColumn
                    ? row.original.properties[titleColumn]?.value
                    : undefined;
                  const returnFocus = getReturnFocus?.();
                  onClose?.();
                  openRowLog(
                    rowId,
                    typeof title === "string" ? title : undefined,
                    returnFocus,
                  );
                },
              },
            ]
          : []),
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
  const hotkeyOptions = {
    ignoreEventWhen: (event: KeyboardEvent) =>
      isOpen() || event.target !== searchInputRef.current,
    enableOnFormTags: ["INPUT"] as const,
    preventDefault: true,
  };
  useHotkeys("meta+shift+enter", openInNewTab, hotkeyOptions);
  useHotkeys("meta+d", duplicateRow, hotkeyOptions);
  useHotkeys("backspace", deleteRow, hotkeyOptions);

  return (
    <Autocomplete<Action>
      items={groups}
      itemToStringValue={(action) => action.value}
      open
      autoHighlight="always"
      openOnInputClick
    >
      <AutocompleteInput
        ref={searchInputRef}
        aria-label="Search actions"
        placeholder="Search actions..."
      />
      <AutocompleteContent variant="inline">
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
                            key={action.value}
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
