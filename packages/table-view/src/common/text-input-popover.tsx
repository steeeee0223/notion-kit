"use client";

import React, { useId, useState } from "react";

import { cn } from "@notion-kit/cn";
import { useInputField, useRect } from "@notion-kit/hooks";
import {
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@notion-kit/ui/primitives";

interface TextInputPopoverProps extends TextInputPopoverContentProps {
  renderTrigger: ({ width }: { width: number }) => React.ReactElement;
}

export function TextInputPopover({
  renderTrigger,
  onUpdate,
  ...props
}: TextInputPopoverProps) {
  const { ref, rect } = useRect<HTMLButtonElement>();
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        ref={ref}
        nativeButton={false}
        render={renderTrigger({ width: rect.width })}
      />
      <PopoverContent
        side="bottom"
        sideOffset={-rect.height}
        align="start"
        className="max-h-[773px] min-h-[38px] w-60 overflow-visible backdrop-filter-none"
      >
        <TextInputPopoverContent
          {...props}
          onCancel={() => setOpen(false)}
          onUpdate={(v) => {
            onUpdate(v);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export interface TextInputPopoverContentProps {
  className?: string;
  value: string;
  onUpdate: (value: string) => void;
  onCancel?: () => void;
}

export function TextInputPopoverContent({
  className,
  value,
  onUpdate,
  onCancel,
}: TextInputPopoverContentProps) {
  const id = useId();
  const { props, reset } = useInputField({ id, initialValue: value, onUpdate });

  return (
    <Input
      spellCheck
      variant="flat"
      className={cn(
        "max-h-[771px] min-h-9 border-none bg-transparent wrap-break-word whitespace-pre-wrap caret-primary",
        className,
      )}
      {...props}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          reset();
          onCancel?.();
          return;
        }
        props.onKeyDown?.(event);
      }}
    />
  );
}
