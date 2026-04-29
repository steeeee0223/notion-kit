import type { TimelineRange } from "./types";

export const HEADER_HEIGHT = 68;
export const ROW_HEIGHT = 36;

export const COLUMN_WIDTH: Record<TimelineRange, number> = {
  daily: 50,
  monthly: 150,
  quarterly: 100,
};

/**
 * Per-range-type overscan: number of extra columns rendered off-screen
 * on each side to prevent flicker during fast scrolling.
 */
export const OVERSCAN: Record<TimelineRange, number> = {
  daily: 20,
  monthly: 5,
  quarterly: 3,
};
