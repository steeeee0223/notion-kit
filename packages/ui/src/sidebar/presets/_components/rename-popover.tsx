"use client";

import { IconBlock, type IconData } from "~/icon-block";
import { IconMenu } from "~/icon-menu";
import { DropdownMenuSubContent, Input } from "~/primitives";

import { useInputField } from "@notion-kit/hooks";

interface RenamePopoverProps {
  title: string;
  icon: IconData;
  onChange: (value: { title: string; icon: IconData }) => void;
}

export function RenamePopover({ title, icon, onChange }: RenamePopoverProps) {
  const { props } = useInputField({
    id: "rename",
    initialValue: title,
    onUpdate: (value) => onChange({ title: value, icon }),
  });

  return (
    <DropdownMenuSubContent className="flex w-60 items-center gap-1.5 px-2 py-1">
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
        variant="plain"
        className="wrap-break-word whitespace-pre-wrap"
        {...props}
      />
    </DropdownMenuSubContent>
  );
}
