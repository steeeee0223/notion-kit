"use client";

import { useInputField } from "@notion-kit/hooks";
import { IconBlock, type IconData } from "@notion-kit/icon-block";
import { IconMenu } from "@notion-kit/icon-menu";
import { DropdownMenuSubContent, Input } from "@notion-kit/shadcn";

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
        className="break-words whitespace-pre-wrap"
        {...props}
      />
    </DropdownMenuSubContent>
  );
}
