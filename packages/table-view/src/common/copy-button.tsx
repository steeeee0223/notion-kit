"use client";

import { cn } from "@notion-kit/cn";
import { useCopyToClipboard } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import { Button, TooltipPreset } from "@notion-kit/shadcn";

interface CopyButtonProps {
  className?: string;
  value: string;
}

export function CopyButton({ className, value }: CopyButtonProps) {
  const [, copy] = useCopyToClipboard();

  return (
    <div
      className={cn(
        "pointer-events-none absolute top-1.5 right-0 left-0 z-20 mx-1 my-0 flex justify-end",
        className,
      )}
    >
      <div
        id="quick-action-container"
        className="pointer-events-auto sticky right-1 flex bg-transparent"
      >
        <TooltipPreset
          description="Copy to Clipboard"
          side="top"
          className="z-9990"
        >
          <Button
            tabIndex={0}
            aria-label="Copy to Clipboard"
            size="xs"
            className="rounded-md bg-main text-secondary shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              void copy(value);
            }}
          >
            <Icon.Copy className="size-3.5 fill-current" />
          </Button>
        </TooltipPreset>
      </div>
    </div>
  );
}
