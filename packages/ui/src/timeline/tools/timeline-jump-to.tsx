import {
  addMonths,
  addYears,
  startOfMonth,
  startOfQuarter,
  startOfYear,
} from "date-fns";

import { Icon } from "@notion-kit/icons";
import { Button } from "~/primitives";

import {
  useTimelineContext,
  useTimelineSidebarWidth,
} from "../timeline-provider";
import type { TimelineRange } from "../types";
import { getDateByMousePosition, getOffset } from "../utils";

const groupJumpFn: Record<TimelineRange, (ts: Date, step: number) => Date> = {
  daily: (ts, step) => addMonths(startOfMonth(ts), step),
  monthly: (ts, step) => addYears(startOfYear(ts), step),
  quarterly: (ts, step) => addMonths(startOfQuarter(ts), step * 3),
};

export function TimelineJumpTo() {
  const timeline = useTimelineContext();
  const [sidebarWidth] = useTimelineSidebarWidth();

  const jumpByGroup = (step: number) => {
    const scrollElement = timeline.ref?.current;
    if (!scrollElement) return;
    const currentDate = getDateByMousePosition(
      timeline,
      scrollElement.scrollLeft,
    );
    const targetDate = groupJumpFn[timeline.range](currentDate, step);
    const offset = getOffset(targetDate, timeline);
    scrollElement.scrollTo({ left: Math.max(0, offset), behavior: "smooth" });
  };

  const jumpToToday = () => {
    const scrollElement = timeline.ref?.current;
    if (!scrollElement) return;
    const today = Date.now();
    const offset = getOffset(today, timeline);
    const visibleWidth = scrollElement.clientWidth - sidebarWidth;
    scrollElement.scrollTo({
      left: Math.max(0, offset - visibleWidth / 2),
      behavior: "smooth",
    });
  };

  return (
    <div data-slot="timeline-jump-to" className="flex items-center">
      <Button
        variant="hint"
        size="xs"
        aria-label="Previous"
        onClick={() => jumpByGroup(-1)}
      >
        <Icon.Chevron side="left" className="fill-icon" />
      </Button>
      <Button
        variant="hint"
        size="xs"
        className="text-primary"
        onClick={jumpToToday}
      >
        Today
      </Button>
      <Button
        variant="hint"
        size="xs"
        aria-label="Next"
        onClick={() => jumpByGroup(1)}
      >
        <Icon.Chevron side="right" className="fill-icon" />
      </Button>
    </div>
  );
}
