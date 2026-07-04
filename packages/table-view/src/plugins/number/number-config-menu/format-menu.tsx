import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
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
        <div className="text-muted">
          {options.find((option) => option.value === format)?.label}
        </div>
      </DropdownMenuSubTrigger>
      <DropdownMenuContent sideOffset={-4} className="w-48">
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
      </DropdownMenuContent>
    </DropdownMenuSub>
  );
}
