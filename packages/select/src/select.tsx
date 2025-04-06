"use client";

import type { SelectContentProps } from "@notion-kit/shadcn";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@notion-kit/shadcn";

export interface Option {
  label: string;
  description?: string;
}

export interface SelectProps<T extends string = string>
  extends Pick<SelectContentProps, "side" | "align"> {
  className?: string;
  /**
   * @prop `options` maps `value` to `Option.value`
   */
  options: Record<T, string | Option>;
  onChange?: (value: T) => void;
  value?: T;
  placeholder?: string;
  disabled?: boolean;
  hideCheck?: boolean;
  renderOption?: React.FC<{ option?: Option | string }>;
}

function CustomSelect<T extends string = string>({
  className,
  options,
  value,
  placeholder,
  side = "bottom",
  align = "end",
  disabled,
  hideCheck,
  onChange,
  renderOption: OptionValue,
}: SelectProps<T>) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue
          aria-disabled={disabled}
          placeholder={placeholder}
          {...(OptionValue && {
            "aira-label": value,
            children: (
              <OptionValue option={value ? options[value] : undefined} />
            ),
          })}
        />
      </SelectTrigger>
      <SelectContent position="popper" side={side} align={align}>
        <SelectGroup>
          {Object.entries<string | Option>(options).map(([key, option]) => (
            <SelectItem value={key} key={key} hideCheck={hideCheck}>
              <div className="flex items-center truncate">
                {typeof option === "string" ? option : option.label}
              </div>
              {typeof option !== "string" && option.description && (
                <div className="mt-0.5 overflow-hidden text-xs text-ellipsis whitespace-normal text-secondary">
                  {option.description}
                </div>
              )}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export { CustomSelect as Select };
