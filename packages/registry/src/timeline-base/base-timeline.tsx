import { useState } from "react";

import {
  TimelineContent,
  TimelineJumpTo,
  TimelineProvider,
  TimelineRangeHeader,
  TimelineRangeSelect,
  TimelineToday,
  TimelineToolbar,
  type TimelineRange,
} from "@notion-kit/timeline";

export default function BaseTimeline() {
  const [range, setRange] = useState<TimelineRange>("monthly");

  return (
    <TimelineProvider range={range} zoom={100}>
      <TimelineContent>
        <TimelineRangeHeader />
        <TimelineToolbar className="sticky top-px right-0 pe-24 pt-[7px]">
          <TimelineRangeSelect value={range} onChange={setRange} />
          <TimelineJumpTo />
        </TimelineToolbar>
        <TimelineToday />
      </TimelineContent>
    </TimelineProvider>
  );
}
