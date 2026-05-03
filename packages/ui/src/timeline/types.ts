export type TimelineRange = "daily" | "monthly" | "quarterly";

export interface TimelineRangeItem {
  label: string;
  start: number;
}

export interface TimelineSubRangeItem {
  label: string;
  start: number;
  isToday: boolean;
}

export interface TimelineData {
  start: Date;
  end: Date;
  ranges: TimelineRangeItem[];
  subRanges: TimelineSubRangeItem[];
}

export interface TimelineFeature {
  id: string;
  name: string;
  startAt: number;
  endAt: number;
}

export interface TimelineContextProps {
  zoom: number;
  range: TimelineRange;
  onAddItem?: (ts: number) => void;
  timelineData: TimelineData;
  ref: React.RefObject<HTMLDivElement | null> | null;
  scrollToFeature: (feature: TimelineFeature) => void;
  /**
   * `true` while a range-type transition is pending (deferred render in progress).
   */
  isPending?: boolean;
}
