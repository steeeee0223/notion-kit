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
  items: { value: Value; label: string }[];
  onChange: (value: Value) => void;
  disabled?: boolean;
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select
        value={value}
        items={items}
        disabled={disabled}
        onValueChange={(next) => {
          if (next !== null) onChange(next);
        }}
      >
        <SelectTrigger aria-label={label} className="w-full">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map(({ label, value }) => (
              <SelectItem key={value} value={value} label={label} />
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
