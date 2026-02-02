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
  MenuItem,
  MenuItemSelect,
  MenuItemShortcut,
  Popover,
  PopoverContent,
  PopoverTrigger,
  toast,
} from "@notion-kit/shadcn";
import { KEYBOARD } from "@notion-kit/utils";

import { useCodeBlock } from "./code-block-provider";
import { LangMenu, ThemeMenu } from "./menus";

export function CodeBlockActions() {
  const { state } = useCodeBlock();
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
          <CommandItem asChild value="caption">
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
          <CommandItem asChild value="wrap-code">
            <MenuItem Icon={<Icon.ArrowTurnDownLeft />} Body="Wrap code" />
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
        {/* TODO footer */}
      </CommandList>
    </Command>
  );
}
