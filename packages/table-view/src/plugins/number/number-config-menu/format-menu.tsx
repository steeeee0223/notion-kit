import { Icon } from "@notion-kit/icons";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
  MenuItem,
  MenuItemAction,
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
        <MenuItem className="group/format" Body="Number format">
          <MenuItemAction className="flex items-center text-muted">
            {options.find((option) => option.value === format)?.label}
            <Icon.ChevronRight className="ml-1.5 h-full w-3 fill-icon transition-[rotate] group-data-[state='open']/format:rotate-90" />
          </MenuItemAction>
        </MenuItem>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[192px]">
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
