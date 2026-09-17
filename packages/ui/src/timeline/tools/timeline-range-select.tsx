import { DateRangeSelect } from "../../date-view/range-select";
import type { TimelineRange } from "../types";

const OPTIONS = [
  { value: "daily", label: "Day" },
  { value: "monthly", label: "Month" },
  { value: "quarterly", label: "Quarter" },
] satisfies { value: TimelineRange; label: string }[];

export interface TimelineRangeSelectProps {
  value: TimelineRange;
  onChange: (value: TimelineRange) => void;
  disabled?: boolean;
}

export function TimelineRangeSelect(props: TimelineRangeSelectProps) {
  return (
    <DateRangeSelect
      {...props}
      options={OPTIONS}
      slot="timeline-range-select"
    />
  );
}
