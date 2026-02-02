"use client";

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  MenuItem,
  MenuItemCheck,
} from "@notion-kit/shadcn";

import { useCodeBlock } from "../code-block-provider";
import { CODE_BLOCK_LANGUAGES } from "../constant";

export function LangMenu() {
  const { state, store } = useCodeBlock();
  return (
    <Command className="bg-popover">
      <CommandInput placeholder="Search for a language..." />
      <CommandList className="max-h-60">
        <CommandGroup className="flex flex-col gap-px px-0">
          {CODE_BLOCK_LANGUAGES.map((lang) => (
            <CommandItem
              asChild
              key={lang.value}
              value={lang.value}
              onSelect={(lang) => store.setLang(lang)}
            >
              <MenuItem Body={lang.label}>
                {lang.value === state.lang && <MenuItemCheck />}
              </MenuItem>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
