import { createContext, use } from "react";

import type {
  CalendarEventData,
  CalendarEventValue,
  CalendarProviderProps,
  CalendarRange,
  CalendarWeekStartsOn,
} from "./types";

export interface CalendarContextValue {
  events: readonly CalendarEventData[];
  draft: CalendarEventData | null;
  range: CalendarRange;
  anchorDate: number;
  now: number;
  timeZone: string;
  weekStartsOn: CalendarWeekStartsOn;
  readOnly: boolean;
  canCreate: boolean;
  canChange: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  setRange: (range: CalendarRange) => void;
  setAnchorDate: (date: number) => void;
  today: () => void;
  scrollToTime: (minute: number) => void;
  onCreate?: (value: CalendarEventValue) => void;
  onEventClick?: CalendarProviderProps["onEventClick"];
  onEventChange?: CalendarProviderProps["onEventChange"];
  suppressClick: React.RefObject<boolean>;
}
export const CalendarContext = createContext<CalendarContextValue | null>(null);
export function useCalendarContext() {
  const value = use(CalendarContext);
  if (!value)
    throw new Error("Calendar components must be used within CalendarProvider");
  return value;
}
