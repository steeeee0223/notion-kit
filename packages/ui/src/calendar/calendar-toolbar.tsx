import { useLayoutEffect, useRef } from "react";

import { cn } from "@notion-kit/cn";

import { composeRefs } from "@/primitives";

import { DateNavigation } from "../date-view/date-navigation";
import { DateTitle } from "../date-view/date-title";
import { DateRangeSelect } from "../date-view/range-select";
import { useCalendarContext } from "./calendar-context";
import { navigateDate, periodTitle } from "./date-utils";
import type { CalendarRange } from "./types";

const options = [
  { value: "monthly", label: "Month" },
  { value: "weekly", label: "Week" },
  { value: "daily", label: "Day" },
] as const;

export interface CalendarRangeSelectProps {
  value?: CalendarRange;
  onChange?: (range: CalendarRange) => void;
  disabled?: boolean;
}
export function CalendarRangeSelect({
  value,
  onChange,
  disabled,
}: CalendarRangeSelectProps) {
  const calendar = useCalendarContext();
  return (
    <DateRangeSelect
      value={value ?? calendar.range}
      onChange={onChange ?? calendar.setRange}
      disabled={disabled}
      options={options}
      label="Calendar range"
      slot="calendar-range-select"
    />
  );
}

export function CalendarJumpTo() {
  const calendar = useCalendarContext();
  return (
    <DateNavigation
      onPrevious={() =>
        calendar.setAnchorDate(
          navigateDate(
            calendar.anchorDate,
            calendar.range,
            -1,
            calendar.timeZone,
          ),
        )
      }
      onToday={calendar.today}
      onNext={() =>
        calendar.setAnchorDate(
          navigateDate(
            calendar.anchorDate,
            calendar.range,
            1,
            calendar.timeZone,
          ),
        )
      }
      slot="calendar-jump-to"
    />
  );
}

export function CalendarToolbar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="calendar-toolbar"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

export interface CalendarHeaderToolbarProps
  extends React.ComponentProps<"div"> {
  rangeDisabled?: boolean;
  onRangeChange?: (range: CalendarRange) => void;
}
export function CalendarHeaderToolbar({
  rangeDisabled,
  onRangeChange,
  className,
  children,
  ref,
  ...props
}: CalendarHeaderToolbarProps) {
  const calendar = useCalendarContext();
  const toolbarRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    // The toolbar attaches before its ancestor provider ref during layout.
    const element = toolbarRef.current?.closest<HTMLElement>(
      '[data-slot="calendar-view"]',
    );
    element?.style.setProperty("--calendar-toolbar-height", "44px");
    return () => {
      element?.style.removeProperty("--calendar-toolbar-height");
    };
  }, []);

  return (
    <CalendarToolbar
      {...props}
      ref={composeRefs(ref, toolbarRef)}
      data-slot="calendar-header-toolbar"
      className={cn(
        "sticky top-0 z-40 h-11 justify-between border-b bg-main px-3",
        className,
      )}
    >
      <DateTitle className="min-w-0 truncate">
        {periodTitle(
          calendar.anchorDate,
          calendar.range,
          calendar.timeZone,
          calendar.weekStartsOn,
        )}
      </DateTitle>
      <div className="flex shrink-0 items-center gap-2">
        {children}
        <CalendarRangeSelect
          onChange={onRangeChange}
          disabled={rangeDisabled}
        />
        <CalendarJumpTo />
      </div>
    </CalendarToolbar>
  );
}
