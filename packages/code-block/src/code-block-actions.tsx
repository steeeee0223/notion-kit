import React from "react";

import { useCopyToClipboard } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
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
  MenuFooter,
  MenuItemAction,
  MenuItemSelect,
  MenuItemShortcut,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Switch,
  toast,
} from "@notion-kit/ui/primitives";
import { KEYBOARD, toDateString } from "@notion-kit/utils";

import { useCodeBlock } from "./code-block-provider";
import { LangMenu, ThemeMenu } from "./menus";
import { isFormattable } from "./transformers";

interface CodeAction {
  value: string;
  name: string;
  icon: React.ReactNode;
  shortcut?: string;
  action?: React.ReactNode;
  onClick?: () => void | Promise<void>;
  popover?: "language" | "theme";
}

export function CodeBlockActions() {
  const { state, store, lastEditedBy, readonly } = useCodeBlock();
  const { copy } = useCopyToClipboard({
    onSuccess: () => toast.success("Code copied to clipboard"),
  });

  const actions: CodeAction[] = [];

  if (!readonly) {
    actions.push({
      value: "caption",
      name: "Caption",
      icon: <Icon.Caption />,
      shortcut: `${KEYBOARD.CMD}${KEYBOARD.OPTION}M`,
      onClick: () => store.enableCaption(),
    });
  }

  actions.push(
    {
      value: "copy-code",
      name: "Copy code",
      icon: <Icon.CopyCode />,
      onClick: () => copy(state.code),
    },
    {
      value: "wrap-code",
      name: "Wrap code",
      icon: <Icon.ArrowTurnDownLeft />,
      onClick: store.toggleWrap,
      action: (
        <MenuItemAction>
          <Switch size="sm" checked={state.wrap} />
        </MenuItemAction>
      ),
    },
  );

  if (!readonly) {
    actions.push({
      value: "language",
      name: "Language",
      icon: <Icon.CurlyBraces />,
      popover: "language" as const,
    });
  }

  if (!readonly && isFormattable(state.lang)) {
    actions.push({
      value: "format-code",
      name: "Format code",
      icon: <Icon.Lightning />,
      onClick: store.formatCode,
    });
  }

  actions.push({
    value: "theme",
    name: "Theme",
    icon: <Icon.EmojiFace />,
    popover: "theme" as const,
  });

  return (
    <Autocomplete
      items={actions}
      itemToStringValue={(action) => action.name}
      open
      autoHighlight="always"
      openOnInputClick
    >
      <AutocompleteInput placeholder="Search actions..." />
      <AutocompleteContent variant="inline">
        <AutocompleteList>
          <AutocompleteGroup>
            <AutocompleteLabel title="Code" />
            <AutocompleteCollection>
              {(action: CodeAction) => {
                if (action.popover === "language") {
                  return (
                    <Popover key={action.value}>
                      <PopoverTrigger
                        render={
                          <AutocompleteItem
                            value={action}
                            icon={action.icon}
                            label={action.name}
                          >
                            <MenuItemSelect />
                          </AutocompleteItem>
                        }
                      />
                      <PopoverContent side="left" className="w-60">
                        <LangMenu />
                      </PopoverContent>
                    </Popover>
                  );
                }

                if (action.popover === "theme") {
                  return (
                    <Popover key={action.value}>
                      <PopoverTrigger
                        render={
                          <AutocompleteItem
                            value={action}
                            icon={action.icon}
                            label={action.name}
                          >
                            <MenuItemSelect />
                          </AutocompleteItem>
                        }
                      />
                      <PopoverContent side="left" className="w-60">
                        <ThemeMenu />
                      </PopoverContent>
                    </Popover>
                  );
                }

                return (
                  <AutocompleteItem
                    key={action.value}
                    value={action}
                    icon={action.icon}
                    label={action.name}
                    onClick={action.onClick}
                  >
                    {action.shortcut && (
                      <MenuItemShortcut>{action.shortcut}</MenuItemShortcut>
                    )}
                    {action.action}
                  </AutocompleteItem>
                );
              }}
            </AutocompleteCollection>
          </AutocompleteGroup>
          <AutocompleteSeparator />
          <MenuFooter>
            {lastEditedBy && (
              <div className="w-full">Last edited by {lastEditedBy}</div>
            )}
            <div className="w-full">{toDateString(state.ts)}</div>
          </MenuFooter>
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  );
}
