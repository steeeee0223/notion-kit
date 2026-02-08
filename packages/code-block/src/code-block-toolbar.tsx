import { cn } from "@notion-kit/cn";
import { useCopyToClipboard } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  toast,
  TooltipPreset,
  TooltipProvider,
} from "@notion-kit/shadcn";

import { CodeBlockActions } from "./code-block-actions";
import { useCodeBlock } from "./code-block-provider";

export function CodeBlockToolbar() {
  const { copy } = useCopyToClipboard({
    onSuccess: () => toast.success("Code copied to clipboard"),
  });
  const { state, store, readonly } = useCodeBlock();

  return (
    <TooltipProvider>
      <div
        data-slot="code-block-toolbar"
        className={cn(
          "absolute end-1.5 top-1.5 z-10 flex h-6 items-center justify-end rounded-sm bg-popover",
          "opacity-0 transition-opacity group-hover/code-block:opacity-100 focus-within:opacity-100",
        )}
      >
        <div className="flex items-center justify-center text-primary">
          <TooltipPreset side="top" description="Copy">
            <Button
              tabIndex={0}
              variant={null}
              aria-label="Copy"
              className="size-6 shrink-0 rounded-r-none"
              onClick={() => copy(state.code)}
            >
              <Icon.Duplicate className="size-4 fill-secondary" />
            </Button>
          </TooltipPreset>
          {!readonly && (
            <TooltipPreset side="top" description="Caption">
              <Button
                tabIndex={0}
                variant={null}
                aria-label="Caption"
                className="size-6 shrink-0 rounded-none"
                onClick={() => store.enableCaption()}
              >
                <Icon.Caption className="size-4 fill-secondary" />
              </Button>
            </TooltipPreset>
          )}
          <Popover>
            <TooltipPreset side="top" description="More">
              <PopoverTrigger asChild>
                <Button
                  tabIndex={0}
                  variant={null}
                  aria-label="More"
                  className="size-6 shrink-0 rounded-s-none"
                >
                  <Icon.EllipsisSmall className="size-4 fill-secondary" />
                </Button>
              </PopoverTrigger>
            </TooltipPreset>
            <PopoverContent className="w-65">
              <CodeBlockActions />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </TooltipProvider>
  );
}
