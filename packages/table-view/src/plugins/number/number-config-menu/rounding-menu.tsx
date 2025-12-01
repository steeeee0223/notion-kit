import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
  MenuItem,
  MenuItemSelect,
} from "@notion-kit/shadcn";

import type { NumberRound } from "../types";

const options: { label: string; value: NumberRound }[] = [
  { label: "Default", value: "default" },
  { label: "0", value: "0" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
];

interface RoundingMenuProps {
  round: NumberRound;
  onUpdate: (option: NumberRound) => void;
}

export function RoundingMenu({ round, onUpdate }: RoundingMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MenuItem Body="Decimal places">
          <MenuItemSelect>
            {options.find((option) => option.value === round)?.label}
          </MenuItemSelect>
        </MenuItem>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="z-990" align="end">
        <DropdownMenuGroup>
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              Body={option.label}
              checked={round === option.value}
              onCheckedChange={() => onUpdate(option.value)}
            />
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
