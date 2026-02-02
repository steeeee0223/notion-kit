"use client";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@notion-kit/shadcn";

import { useCodeBlock } from "./code-block-provider";
import { CODE_BLOCK_LANGUAGES } from "./constant";
import { LangMenu } from "./menus";

interface CodeBlockCaptionProps {
  className?: string;
}

export function CodeBlockLang({ className }: CodeBlockCaptionProps) {
  const { state } = useCodeBlock();
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
            {
              CODE_BLOCK_LANGUAGES.find((lang) => lang.value === state.lang)
                ?.label
            }
            <Icon.ChevronDown className="size-2.5 fill-icon" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60">
          <LangMenu />
        </PopoverContent>
      </Popover>
    </div>
  );
}
