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
import type { DateFormat } from "@notion-kit/utils";

const options: { label: string; value: DateFormat }[] = [
  { label: "Full date", value: "full" },
  { label: "Short date", value: "short" },
  { label: "Month/Day/Year", value: "MM/dd/yyyy" },
  { label: "Day/Month/Year", value: "dd/MM/yyyy" },
  { label: "Year/Month/Day", value: "yyyy/MM/dd" },
  { label: "Relative", value: "relative" },
];

interface DateFormatMenuProps {
  showIcon?: boolean;
  format: DateFormat;
  onChange: (format: DateFormat) => void;
}

export function DateFormatMenu({
  showIcon,
  format,
  onChange,
}: DateFormatMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MenuItem
          Icon={showIcon ? <Icon.ViewCalendar /> : undefined}
          Body="Date format"
        >
          <MenuItemSelect>
            {options.find((option) => option.value === format)?.label}
          </MenuItemSelect>
        </MenuItem>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-990 w-[180px]">
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
