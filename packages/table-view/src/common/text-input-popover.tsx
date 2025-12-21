"use client";

import React, { useId, useState } from "react";

import { cn } from "@notion-kit/cn";
import { useInputField, useRect } from "@notion-kit/hooks";
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
  value,
  onUpdate,
}: TextInputContentProps) {
  const id = useId();
  const { props } = useInputField({ id, initialValue: value, onUpdate });

  return (
    <Input
      spellCheck
      variant="flat"
      className={cn(
        "max-h-[771px] min-h-9 border-none bg-transparent word-break whitespace-pre-wrap caret-primary",
        className,
      )}
      {...props}
    />
  );
}
