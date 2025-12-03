import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
  MenuItem,
  MenuItemSelect,
} from "@notion-kit/shadcn";

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MenuItem Body="Number format">
          <MenuItemSelect>
            {options.find((option) => option.value === format)?.label}
          </MenuItemSelect>
        </MenuItem>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-990 w-48">
        <DropdownMenuGroup>
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              Body={option.label}
              checked={format === option.value}
              onCheckedChange={() => onUpdate(option.value)}
            />
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
