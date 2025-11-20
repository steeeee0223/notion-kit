"use client";

import React, { useRef, useState } from "react";

import { IconBlock, type IconData } from "@notion-kit/icon-block";
import { IconMenu } from "@notion-kit/icon-menu";
import {
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@notion-kit/shadcn";

interface RenamePopoverProps extends React.PropsWithChildren {
  title: string;
  icon: IconData;
  onChange: (value: { title: string; icon: IconData }) => void;
}

export const RenamePopover: React.FC<RenamePopoverProps> = ({
  children,
  title,
  icon,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const onOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen)
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      const value = inputRef.current?.value;
      if (value && value !== title) onChange({ title: value, icon });
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange} modal>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="flex w-[380px] items-center gap-1.5 px-2 py-1"
        onClick={(e) => e.stopPropagation()}
      >
        <IconMenu
          className="size-7 shrink-0 border border-border-button hover:bg-default/5"
          onSelect={(icon) => onChange({ title, icon })}
          onRemove={() =>
            onChange({ title, icon: { type: "lucide", src: "file" } })
          }
        >
          <IconBlock icon={icon} className="p-0 text-lg/[22px]" />
        </IconMenu>
        <Input
          ref={inputRef}
          variant="plain"
          className="wrap-break-word whitespace-pre-wrap"
          value={title}
          onChange={(e) => onChange({ title: e.target.value, icon })}
          onKeyDown={onKeyDown}
        />
      </PopoverContent>
    </Popover>
  );
};
