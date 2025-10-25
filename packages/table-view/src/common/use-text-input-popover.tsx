"use client";

import React, { useEffect, useState } from "react";

import { cn } from "@notion-kit/cn";
import {
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@notion-kit/shadcn";

import { useTriggerPosition } from "../common";

interface TextInputPopoverProps extends TextInputContentProps {
  renderTrigger: ({ width }: { width: number }) => React.ReactNode;
}

export function TextInputPopover({
  renderTrigger,
  ...props
}: TextInputPopoverProps) {
  const { ref, position, width } = useTriggerPosition<HTMLButtonElement>();
  return (
    <Popover>
      <PopoverTrigger ref={ref} asChild>
        {renderTrigger({ width })}
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        sideOffset={-position.h}
        align="start"
        className="max-h-[773px] min-h-[38px] w-60 overflow-visible backdrop-filter-none"
      >
        <TextInputContent {...props} />
      </PopoverContent>
    </Popover>
  );
}

interface TextInputContentProps {
  className?: string;
  value: string;
  onUpdate?: (value: string) => void;
}

function TextInputContent({
  className,
  value: initialValue,
  onUpdate,
}: TextInputContentProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <Input
      spellCheck
      variant="flat"
      value={value}
      onChange={(e) => {
        e.preventDefault();
        setValue(e.target.value);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") onUpdate?.(value);
      }}
      onBlur={() => onUpdate?.(value)}
      className={cn(
        "max-h-[771px] min-h-8 border-none bg-transparent word-break whitespace-pre-wrap caret-primary",
        className,
      )}
    />
  );
}
