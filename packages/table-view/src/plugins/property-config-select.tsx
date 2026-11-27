import { useId } from "react";

import {
  Field,
  FieldLabel,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@notion-kit/ui/primitives";

export function PropertyConfigSelect<Value extends string>({
  label,
  value,
  items,
  onChange,
  disabled,
}: {
  label: string;
  value: Value | null;
  items: { value: Value; label: string; disabled?: boolean }[];
  onChange: (value: Value) => void;
  disabled?: boolean;
}) {
  const triggerId = useId();
  return (
    <Field>
      <FieldLabel htmlFor={triggerId}>{label}</FieldLabel>
      <Select
        value={value}
        items={items}
        disabled={disabled}
        onValueChange={(next) => {
          if (next !== null) onChange(next);
        }}
      >
        <SelectTrigger id={triggerId} className="w-full">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map(({ label, value, disabled }) => (
              <SelectItem
                key={value}
                value={value}
                label={label}
                disabled={disabled}
              />
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
