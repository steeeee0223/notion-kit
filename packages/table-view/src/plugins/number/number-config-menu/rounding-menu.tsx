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
        <MenuItem className="group/round" Body="Decimal places">
          <MenuItemAction className="flex items-center text-muted">
            {options.find((option) => option.value === round)?.label}
            <Icon.ChevronRight className="ml-1.5 h-full w-3 fill-icon transition-[rotate] group-data-[state='open']/round:rotate-90" />
          </MenuItemAction>
        </MenuItem>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
