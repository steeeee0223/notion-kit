import { Icon } from "@notion-kit/icons";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
  MenuItem,
  MenuItemSelect,
} from "@notion-kit/shadcn";

import { TimeFormat } from "../types";

const options: { label: string; value: TimeFormat }[] = [
  { label: "Hidden", value: "hidden" },
  { label: "12-hour", value: "12-hour" },
  { label: "24-hour", value: "24-hour" },
];

interface TimeFormatMenuProps {
  showIcon?: boolean;
  format: TimeFormat;
  onChange: (format: TimeFormat) => void;
}

export function TimeFormatMenu({
  showIcon,
  format,
  onChange,
}: TimeFormatMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MenuItem
          Body="Time format"
          Icon={showIcon ? <Icon.Clock /> : undefined}
        >
          <MenuItemSelect>
            {options.find((option) => option.value === format)?.label}
          </MenuItemSelect>
        </MenuItem>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuGroup>
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              Body={option.label}
              checked={format === option.value}
              onCheckedChange={() => onChange(option.value)}
            />
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
