import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/primitives";

export interface DateRangeSelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  disabled?: boolean;
  label?: string;
  slot?: string;
}

export function DateRangeSelect<T extends string>({
  value,
  onChange,
  options,
  disabled,
  label = "Date range",
  slot,
}: DateRangeSelectProps<T>) {
  return (
    <Select
      data-slot={slot}
      items={options}
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        if (next !== null) onChange(next);
      }}
    >
      <SelectTrigger
        aria-label={label}
        className="h-6 w-auto min-w-12 border-none px-1.5 text-secondary"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              label={option.label}
            />
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
