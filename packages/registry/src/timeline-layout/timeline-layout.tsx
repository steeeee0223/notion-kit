"use client";

import { useState } from "react";

import {
  TimelineContent,
  TimelineHeaderToolbar,
  TimelineProvider,
  TimelineRangeHeader,
  TimelineToday,
  type TimelineRange,
} from "@notion-kit/timeline";

export default function TimelineLayout() {
  const [range, setRange] = useState<TimelineRange>("monthly");

  return (
    <TimelineProvider range={range} zoom={100}>
      <TimelineContent>
        <TimelineRangeHeader />
        <TimelineHeaderToolbar onRangeChange={setRange} />
        <TimelineToday />
      </TimelineContent>
    </TimelineProvider>
  );
}
