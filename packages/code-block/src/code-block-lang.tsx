"use client";

import { cn } from "@notion-kit/cn";
import { useFilter } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  Input,
  MenuItem,
  MenuItemCheck,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@notion-kit/shadcn";

import { useCodeBlock } from "./code-block-provider";
import { CODE_BLOCK_LANGUAGES } from "./constant";

interface CodeBlockCaptionProps {
  className?: string;
}

export function CodeBlockLang({ className }: CodeBlockCaptionProps) {
  const { state, store } = useCodeBlock();

  const { search, results, updateSearch } = useFilter(
    CODE_BLOCK_LANGUAGES,
    (lang, v) => lang.value.toLowerCase().includes(v),
  );
  return (
    <div
      className={cn(
        "absolute start-2 top-2 z-10 flex items-center justify-end text-secondary",
        "opacity-0 transition-opacity group-hover/code-block:opacity-100 has-data-[state=open]:opacity-100",
        className,
      )}
    >
      <Popover
        onOpenChange={(open) => {
          if (open) return;
          updateSearch("");
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant={null}
            className="h-5 min-w-0 shrink-0 px-1.5 text-xs/[1.2] text-secondary"
          >
            {
              CODE_BLOCK_LANGUAGES.find((lang) => lang.value === state.lang)
                ?.label
            }
            <Icon.ChevronDown className="size-2.5 fill-icon" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60">
          <Command className="bg-popover">
            <div className="flex min-w-0 flex-auto flex-col px-3 pt-3 pb-2">
              <Input
                value={search}
                onChange={(e) => updateSearch(e.target.value)}
                placeholder="Search for a language..."
              />
            </div>
            <CommandList className="max-h-100 overflow-y-auto">
              {results && results.length > 0 && (
                <CommandGroup className="flex flex-col gap-px px-0">
                  {results.map((lang) => (
                    <CommandItem
                      asChild
                      key={lang.value}
                      value={lang.value}
                      onSelect={(lang) => store.updateHtml({ lang })}
                    >
                      <MenuItem Body={lang.label}>
                        {lang.value === state.lang && <MenuItemCheck />}
                      </MenuItem>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
