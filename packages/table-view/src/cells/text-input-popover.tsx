"use client";

import React, { useState } from "react";

import {
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@notion-kit/shadcn";

type TextInputPopoverProps = React.PropsWithChildren<{
  position: { top?: number; left?: number };
  value: string;
  onChange?: (value: string) => void;
}>;

export const TextInputPopover: React.FC<TextInputPopoverProps> = ({
  position,
  value: initialValue,
  onChange,
  children,
}) => {
  const [value, setValue] = useState(initialValue);

  return (
    <Popover modal>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side="bottom"
        sideOffset={-(position.top ?? 0)}
        align="start"
        className="z-[990] flex max-h-[773px] min-h-[34px] w-60 flex-col overflow-visible backdrop-filter-none"
        onBlur={() => onChange?.(value)}
      >
        <Input
          spellCheck
          variant="flat"
          value={value}
          onChange={(e) => {
            e.preventDefault();
            setValue(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") onChange?.(value);
          }}
          className="max-h-[771px] min-h-8 border-none bg-transparent word-break whitespace-pre-wrap caret-primary"
        />
        {/* <div className="flex flex-col overflow-y-auto grow h-full px-2 py-1.5 min-h-[34px] justify-between text-sm font-medium">
            <div spellCheck contentEditable data-content-editable-leaf className="w-full max-w-full whitespace-pre-wrap word-break caret-primary">{value}</div>
        </div> */}
      </PopoverContent>
    </Popover>
  );
};
