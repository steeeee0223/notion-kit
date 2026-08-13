import type { NumberFormat } from "@notion-kit/table-hook/plugins";
import {
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
} from "@notion-kit/ui/primitives";

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
        <DropdownMenuRadioGroup
          value={format}
          onValueChange={(value: NumberFormat) => onUpdate(value)}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              closeOnClick={false}
              label={option.label}
            />
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenuSub>
  );
}
