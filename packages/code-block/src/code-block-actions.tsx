import { useState } from "react";

import { useCopyToClipboard } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  MenuFooter,
  MenuItem,
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

  return (
    <Command shouldFilter>
      <CommandInput placeholder="Search actions..." />
      <CommandList>
        <CommandGroup heading="Code">
          {!readonly && (
            <CommandItem
              asChild
              value="caption"
              onSelect={() => store.enableCaption()}
            >
              <MenuItem icon={<Icon.Caption />} label="Caption">
                <MenuItemShortcut>
                  {KEYBOARD.CMD}
                  {KEYBOARD.OPTION}M
                </MenuItemShortcut>
              </MenuItem>
            </CommandItem>
          )}
          <CommandItem
            asChild
            value="copy-code"
            onSelect={() => copy(state.code)}
          >
            <MenuItem icon={<Icon.CopyCode />} label="Copy code" />
          </CommandItem>
          <CommandItem asChild value="wrap-code" onSelect={store.toggleWrap}>
            <MenuItem icon={<Icon.ArrowTurnDownLeft />} label="Wrap code">
              <MenuItemAction>
                <Switch size="sm" checked={state.wrap} />
              </MenuItemAction>
            </MenuItem>
          </CommandItem>
          {!readonly && (
            <Popover open={openLangSelect} onOpenChange={setOpenLangSelect}>
              <PopoverTrigger asChild>
                <CommandItem
                  asChild
                  value="language"
                  onPointerEnter={() => setOpenLangSelect(true)}
                  onSelect={() => setOpenLangSelect((v) => !v)}
                >
                  <MenuItem icon={<Icon.CurlyBraces />} label="Language">
                    <MenuItemSelect />
                  </MenuItem>
                </CommandItem>
              </PopoverTrigger>
              <PopoverContent side="left" className="w-60">
                <LangMenu />
              </PopoverContent>
            </Popover>
          )}
          {!readonly && isFormattable(state.lang) && (
            <CommandItem
              asChild
              value="format-code"
              onSelect={store.formatCode}
            >
              <MenuItem icon={<Icon.Lightning />} label="Format code" />
            </CommandItem>
          )}
          <Popover open={openThemeSelect} onOpenChange={setOpenThemeSelect}>
            <PopoverTrigger asChild>
              <CommandItem
                asChild
                value="theme"
                onPointerEnter={() => setOpenThemeSelect(true)}
                onSelect={() => setOpenThemeSelect((v) => !v)}
              >
                <MenuItem icon={<Icon.EmojiFace />} label="Theme">
                  <MenuItemSelect />
                </MenuItem>
              </CommandItem>
            </PopoverTrigger>
            <PopoverContent side="left" className="w-60">
              <ThemeMenu />
            </PopoverContent>
          </Popover>
        </CommandGroup>
        <CommandSeparator />
        <MenuFooter>
          {lastEditedBy && (
            <div className="w-full">Last edited by {lastEditedBy}</div>
          )}
          <div className="w-full">{toDateString(state.ts)}</div>
        </MenuFooter>
      </CommandList>
    </Command>
  );
}
