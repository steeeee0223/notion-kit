import type React from "react";

export type CalendarRange = "daily" | "weekly" | "monthly";
export type CalendarWeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export interface CalendarEventData {
  id: string;
  name: string;
  startAt: number;
  /** Exclusive boundary. Null retains an event with no saved end. */
  endAt: number | null;
  allDay: boolean;
}
export type CalendarEventValue = Pick<
  CalendarEventData,
  "startAt" | "endAt" | "allDay"
>;
export type CalendarEventChangeReason =
  | "move"
  | "resize-start"
  | "resize-end"
  | "convert";
export type CalendarEventChange = CalendarEventValue & {
  id: string;
  reason: CalendarEventChangeReason;
};
export type CalendarArea = "month" | "all-day" | "time";
export interface CalendarEventSegment {
  key: string;
  event: CalendarEventData;
  area: CalendarArea;
  day: number;
  dayOffset: number;
  isStart: boolean;
  isEnd: boolean;
  column: number;
  span: number;
  lane: number;
  startMinute: number;
  endMinute: number;
  columnCount: number;
}
export interface CalendarEventRenderProps {
  event: CalendarEventData;
  segment: CalendarEventSegment;
}
export type CalendarEventRenderer = (
  props: CalendarEventRenderProps,
) => React.ReactNode;
export interface CalendarProviderProps extends React.PropsWithChildren {
  events: readonly CalendarEventData[];
  range?: CalendarRange;
  defaultRange?: CalendarRange;
  onRangeChange?: (range: CalendarRange) => void;
  anchorDate?: number;
  defaultAnchorDate?: number;
  onAnchorDateChange?: (date: number) => void;
  timeZone?: string;
  weekStartsOn?: CalendarWeekStartsOn;
  readOnly?: boolean;
  onCreate?: (value: CalendarEventValue) => void;
  onEventClick?: (event: CalendarEventData) => void;
  onEventChange?: (change: CalendarEventChange) => void;
  className?: string;
}
