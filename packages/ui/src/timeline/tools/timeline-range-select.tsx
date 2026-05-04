import { SelectPreset } from "@/primitives";

import type { TimelineRange } from "../types";

interface TimelineRangeSelectProps {
  value: TimelineRange;
  onChange: (value: TimelineRange) => void;
}

export function TimelineRangeSelect({
  value,
  onChange,
}: TimelineRangeSelectProps) {
  return (
    <SelectPreset
      data-slot="timeline-range-select"
      className="h-6 w-auto min-w-12 border-none px-1.5 text-secondary"
      options={{
        // hourly: "Hours",
        daily: "Day",
        // weekly: "Week",
        // "bi-weekly": "Bi-week",
        monthly: "Month",
        quarterly: "Quarter",
        // yearly: "Year",
        // "5-years": "5-years",
      }}
      value={value}
      onChange={onChange}
      hideCheck
    />
  );
}
