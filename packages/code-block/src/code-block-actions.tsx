import { useState, type ReactNode } from "react";

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

export function CodeBlockActions() {
  const { state, store, lastEditedBy, readonly } = useCodeBlock();
  const { copy } = useCopyToClipboard({
    onSuccess: () => toast.success("Code copied to clipboard"),
  });

  const [openThemeSelect, setOpenThemeSelect] = useState(false);
  const [openLangSelect, setOpenLangSelect] = useState(false);

  type CodeAction = {
    value: string;
    name: string;
    icon: ReactNode;
    shortcut?: string;
    action?: ReactNode;
    onClick?: () => void | Promise<void>;
    popover?: "language" | "theme";
  };

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

  actions.push(
    {
      value: "theme",
      name: "Theme",
      icon: <Icon.EmojiFace />,
      popover: "theme" as const,
    },
  );

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
          <AutocompleteGroup items={actions}>
            <AutocompleteLabel title="Code" />
            <AutocompleteCollection>
              {(action: (typeof actions)[number]) => {
                if (action.popover === "language") {
                  return (
                    <Popover
                      key={action.value}
                      open={openLangSelect}
                      onOpenChange={setOpenLangSelect}
                    >
                      <PopoverTrigger asChild>
                        <AutocompleteItem
                          value={action}
                          icon={action.icon}
                          label={action.name}
                          onPointerEnter={() => setOpenLangSelect(true)}
                          onClick={() => setOpenLangSelect((v) => !v)}
                        >
                          <MenuItemSelect />
                        </AutocompleteItem>
                      </PopoverTrigger>
                      <PopoverContent side="left" className="w-60">
                        <LangMenu />
                      </PopoverContent>
                    </Popover>
                  );
                }

                if (action.popover === "theme") {
                  return (
                    <Popover
                      key={action.value}
                      open={openThemeSelect}
                      onOpenChange={setOpenThemeSelect}
                    >
                      <PopoverTrigger asChild>
                        <AutocompleteItem
                          value={action}
                          icon={action.icon}
                          label={action.name}
                          onPointerEnter={() => setOpenThemeSelect(true)}
                          onClick={() => setOpenThemeSelect((v) => !v)}
                        >
                          <MenuItemSelect />
                        </AutocompleteItem>
                      </PopoverTrigger>
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
