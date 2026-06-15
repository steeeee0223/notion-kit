import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/primitives";

import type { TimelineRange } from "../types";

const OPTIONS = [
  // {value: "hourly", label: "Hours"},
  { value: "daily", label: "Day" },
  // {value: "weekly", label: "Week"},
  // {value: "bi-hourly", label: "Bi-week"},
  { value: "monthly", label: "Month" },
  { value: "quarterly", label: "Quarter" },
  // {value: "yearly", label: "Year"},
  // {value: "5-years", label: "5-year"},
] satisfies { value: TimelineRange; label: string }[];

interface TimelineRangeSelectProps {
  value: TimelineRange;
  onChange: (value: TimelineRange) => void;
}

export function TimelineRangeSelect({
  value,
  onChange,
}: TimelineRangeSelectProps) {
  return (
    <Select
      data-slot="timeline-range-select"
      items={OPTIONS}
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue !== null) onChange(nextValue);
      }}
    >
      <SelectTrigger className="h-6 w-auto min-w-12 border-none px-1.5 text-secondary">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              label={option.label}
              hideCheck
            />
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
