"use client";

import React, { useState } from "react";

import { cn } from "@notion-kit/cn";
import { useRect } from "@notion-kit/hooks";
import {
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@notion-kit/shadcn";

interface TextInputPopoverProps extends TextInputContentProps {
  renderTrigger: ({ width }: { width: number }) => React.ReactNode;
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
      <PopoverTrigger ref={ref} asChild>
        {renderTrigger({ width: rect.width })}
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        sideOffset={-rect.height}
        align="start"
        className="max-h-[773px] min-h-[38px] w-60 overflow-visible backdrop-filter-none"
      >
        <TextInputContent
          {...props}
          onUpdate={(v) => {
            onUpdate(v);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

interface TextInputContentProps {
  className?: string;
  value: string;
  onUpdate: (value: string) => void;
}

function TextInputContent({
  className,
  value: initialValue,
  onUpdate,
}: TextInputContentProps) {
  const [value, setValue] = useState(initialValue);

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
        if (e.key === "Enter") onUpdate(value);
      }}
      onBlur={() => onUpdate(value)}
      className={cn(
        "max-h-[771px] min-h-9 border-none bg-transparent word-break whitespace-pre-wrap caret-primary",
        className,
      )}
    />
  );
}
