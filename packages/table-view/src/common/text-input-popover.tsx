"use client";

import React, { useEffect, useId, useRef, useState } from "react";

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
  onOpenChange?: (open: boolean) => void;
}

export function TextInputPopover({
  renderTrigger,
  onUpdate,
  onOpenChange,
  ...props
}: TextInputPopoverProps) {
  const { ref, rect } = useRect<HTMLButtonElement>();
  const [open, setOpen] = useState(false);
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
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
          onCancel={() => handleOpenChange(false)}
          onUpdate={(v) => {
            onUpdate(v);
            handleOpenChange(false);
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
  commitOnUnchanged?: boolean;
}

export function TextInputPopoverContent({
  className,
  value,
  onUpdate,
  onCancel,
  commitOnUnchanged,
}: TextInputPopoverContentProps) {
  const id = useId();
  const currentValue = useRef(value);
  const { props, reset } = useInputField({
    id,
    initialValue: value,
    onUpdate,
  });

  useEffect(() => {
    currentValue.current = value;
  }, [value]);

  return (
    <Input
      spellCheck
      variant="flat"
      className={cn(
        "max-h-[771px] min-h-9 border-none bg-transparent wrap-break-word whitespace-pre-wrap caret-primary",
        className,
      )}
      {...props}
      onChange={(event) => {
        currentValue.current = event.target.value;
        props.onChange?.(event);
      }}
      onBlur={(event) => {
        if (commitOnUnchanged) {
          onUpdate(currentValue.current);
          return;
        }
        props.onBlur?.(event);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          reset();
          onCancel?.();
          return;
        }
        if (commitOnUnchanged && event.key === "Enter") {
          event.stopPropagation();
          onUpdate(currentValue.current);
          return;
        }
        props.onKeyDown?.(event);
      }}
    />
  );
}
