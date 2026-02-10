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

interface CodeBlockLangProps {
  className?: string;
}

export function CodeBlockLang({ className }: CodeBlockLangProps) {
  const { state, readonly } = useCodeBlock();

  const langLabel = CODE_BLOCK_LANGUAGES.find(
    (lang) => lang.value === state.lang,
  )?.label;

  return (
    <div
      data-slot="code-block-lang"
      className={cn(
        "absolute start-2 top-2 z-10 flex items-center justify-end text-secondary",
        !readonly &&
          "opacity-0 transition-opacity group-hover/code-block:opacity-100 has-data-[state=open]:opacity-100",
        className,
      )}
    >
      {readonly ? (
        <span className="inline-flex h-5 items-center px-1.5 text-xs/tight text-secondary">
          {langLabel}
        </span>
      ) : (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={null}
              className="h-5 min-w-0 shrink-0 px-1.5 text-xs/tight text-secondary"
            >
              {langLabel}
              <Icon.ChevronDown className="size-2.5 fill-icon" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60">
            <LangMenu />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
