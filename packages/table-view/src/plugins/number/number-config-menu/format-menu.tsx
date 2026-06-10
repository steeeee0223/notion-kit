import {
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  MenuItemSelect,
} from "@notion-kit/ui/primitives";

import type { NumberFormat } from "../types";

const options: { label: string; value: NumberFormat }[] = [
  { label: "Number", value: "number" },
  { label: "Number with commas", value: "number_with_commas" },
  { label: "Percent", value: "percent" },
  { label: "Currency", value: "currency" },
];

interface FormatMenuProps {
  format: NumberFormat;
  onUpdate: (format: NumberFormat) => void;
}

export function FormatMenu({ format, onUpdate }: FormatMenuProps) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger label="Number format">
        <MenuItemSelect>
          {options.find((option) => option.value === format)?.label}
        </MenuItemSelect>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-48">
        <DropdownMenuGroup>
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              closeOnClick={false}
              label={option.label}
              checked={format === option.value}
              onCheckedChange={() => onUpdate(option.value)}
            />
          ))}
        </DropdownMenuGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
