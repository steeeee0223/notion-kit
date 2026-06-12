import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
} from "@notion-kit/ui/primitives";

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
    <DropdownMenuSub>
      <DropdownMenuSubTrigger label="Decimal places">
        <div className="text-muted">
          {options.find((option) => option.value === round)?.label}
        </div>
      </DropdownMenuSubTrigger>
      <DropdownMenuContent sideOffset={-4}>
        <DropdownMenuGroup>
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              closeOnClick={false}
              label={option.label}
              checked={round === option.value}
              onCheckedChange={() => onUpdate(option.value)}
            />
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenuSub>
  );
}
