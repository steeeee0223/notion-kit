import type { ReactNode } from "react";

import {
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
} from "@notion-kit/ui/primitives";

export function PropertySettingMenu<Value extends string>({
  label,
  icon,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  icon?: ReactNode;
  value: Value | null;
  options: readonly { label: string; value: Value; disabled?: boolean }[];
  onChange: (value: Value) => void;
  disabled?: boolean;
}) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger label={label} icon={icon} disabled={disabled}>
        <span className="truncate text-muted">
          {options.find((option) => option.value === value)?.label}
        </span>
      </DropdownMenuSubTrigger>
      <DropdownMenuContent sideOffset={-4} className="w-56">
        <DropdownMenuRadioGroup value={value ?? ""} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              {...option}
              closeOnClick={false}
            />
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenuSub>
  );
}
