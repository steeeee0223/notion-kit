"use client";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  MenuItem,
  MenuItemCheck,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@notion-kit/shadcn";

import { CODE_BLOCK_LANGUAGES } from "./constant";

interface CodeBlockCaptionProps {
  className?: string;
  value?: string;
  onChange?: (lang: string) => void;
}

export function CodeBlockLang({
  className,
  value = "plain-text",
  onChange,
}: CodeBlockCaptionProps) {
  return (
    <div
      className={cn(
        "absolute start-2 top-2 z-10 flex items-center justify-end text-secondary",
        "opacity-0 transition-opacity group-hover/code-block:opacity-100 has-data-[state=open]:opacity-100",
        className,
      )}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={null}
            className="h-5 min-w-0 shrink-0 px-1.5 text-xs/[1.2] text-secondary"
          >
            {CODE_BLOCK_LANGUAGES.find((lang) => lang.value === value)?.label}
            <Icon.ChevronDown className="size-2.5 fill-icon" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60">
          <Command className="bg-popover">
            <CommandInput placeholder="Search for a language..." />
            <CommandList className="max-h-100 overflow-y-auto">
              <CommandGroup className="flex flex-col gap-px px-0">
                {CODE_BLOCK_LANGUAGES.map((lang) => (
                  <CommandItem
                    asChild
                    key={lang.value}
                    value={lang.value}
                    onSelect={onChange}
                  >
                    <MenuItem Body={lang.label}>
                      {lang.value === value && <MenuItemCheck />}
                    </MenuItem>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
