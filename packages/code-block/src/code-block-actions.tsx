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
} from "@notion-kit/shadcn";
import { KEYBOARD, toDateString } from "@notion-kit/utils";

import { useCodeBlock } from "./code-block-provider";
import { LangMenu, ThemeMenu } from "./menus";

export function CodeBlockActions() {
  const { state, store, lastEditedBy } = useCodeBlock();
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
          <CommandItem
            asChild
            value="caption"
            onSelect={() => store.enableCaption()}
          >
            <MenuItem Icon={<Icon.Caption />} Body="Caption">
              <MenuItemShortcut>
                {KEYBOARD.CMD}
                {KEYBOARD.OPTION}M
              </MenuItemShortcut>
            </MenuItem>
          </CommandItem>
          <CommandItem
            asChild
            value="copy-code"
            onSelect={() => copy(state.code)}
          >
            <MenuItem Icon={<Icon.CopyCode />} Body="Copy code" />
          </CommandItem>
          <CommandItem asChild value="wrap-code" onSelect={store.toggleWrap}>
            <MenuItem Icon={<Icon.ArrowTurnDownLeft />} Body="Wrap code">
              <MenuItemAction>
                <Switch size="sm" checked={state.wrap} />
              </MenuItemAction>
            </MenuItem>
          </CommandItem>
          <Popover open={openLangSelect} onOpenChange={setOpenLangSelect}>
            <PopoverTrigger asChild>
              <CommandItem
                asChild
                value="language"
                onPointerEnter={() => setOpenLangSelect(true)}
                onSelect={() => setOpenLangSelect((v) => !v)}
              >
                <MenuItem Icon={<Icon.CurlyBraces />} Body="Language">
                  <MenuItemSelect />
                </MenuItem>
              </CommandItem>
            </PopoverTrigger>
            <PopoverContent side="left" className="w-60">
              <LangMenu />
            </PopoverContent>
          </Popover>
          <CommandItem asChild value="format-code">
            <MenuItem Icon={<Icon.Lightning />} Body="Format code" />
          </CommandItem>
          <Popover open={openThemeSelect} onOpenChange={setOpenThemeSelect}>
            <PopoverTrigger asChild>
              <CommandItem
                asChild
                value="theme"
                onPointerEnter={() => setOpenThemeSelect(true)}
                onSelect={() => setOpenThemeSelect((v) => !v)}
              >
                <MenuItem Icon={<Icon.EmojiFace />} Body="Theme">
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
