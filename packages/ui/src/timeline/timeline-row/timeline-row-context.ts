import React from "react";

import type { TimelineFeature } from "../types";

export type TimelineRowGesture = "move" | "resize-start" | "resize-end";

interface TimelineRowState {
  authoritativeStartAt: Date;
  authoritativeEndAt: Date | null;
  draftStartAt: Date;
  draftEndAt: Date | null;
  startAt: Date;
  endAt: Date | null;
  gesture: TimelineRowGesture | null;
}

interface TimelineRowActions {
  begin: (gesture: TimelineRowGesture) => void;
  move: () => void;
  cancel: () => void;
  commit: () => void;
  consumeItemClick: (event: React.MouseEvent<HTMLButtonElement>) => boolean;
}

interface TimelineRowMeta {
  item: TimelineFeature;
  movable: boolean;
  width: number;
  offset: number;
  resizeEndAt: Date;
}

export interface TimelineRowContextValue {
  state: TimelineRowState;
  actions: TimelineRowActions;
  meta: TimelineRowMeta;
}

export const TimelineRowContext =
  React.createContext<TimelineRowContextValue | null>(null);

export function useTimelineRowContext() {
  const context = React.useContext(TimelineRowContext);
  if (!context) {
    throw new Error("TimelineRow parts must be used within TimelineRow.Root");
  }

  return context;
}
