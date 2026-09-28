"use client";

import { cn } from "@notion-kit/cn";
import { useCopyToClipboard } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import { Button, TooltipPreset } from "@notion-kit/ui/primitives";

import { useTableViewMessages } from "@/messages";

interface CopyButtonProps {
  className?: string;
  value: string;
}

export function CopyButton({ className, value }: CopyButtonProps) {
  const { copy } = useCopyToClipboard();
  const messages = useTableViewMessages();

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-1.5 z-20 mx-1 my-0 flex justify-end",
        className,
      )}
    >
      <div
        id="quick-action-container"
        className="pointer-events-auto sticky right-1 flex bg-transparent"
      >
        <TooltipPreset
          description={messages.aria.copyToClipboard}
          side="top"
          className="z-9990"
        >
          <Button
            tabIndex={0}
            aria-label={messages.aria.copyToClipboard}
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
