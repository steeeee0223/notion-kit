import React from "react";

import { TimelineItem, type TimelineItemProps } from "./timeline-item";
import { TimelineJumpToItem } from "./timeline-jump-to-item";

export type TimelineRowProps = TimelineItemProps;

export function TimelineRow({ item, ...props }: TimelineRowProps) {
  return (
    <React.Fragment>
      {/* Scrollable Content */}
      <TimelineJumpToItem item={item} />
      {/* Timeline Item */}
      <TimelineItem item={item} {...props} />
    </React.Fragment>
  );
}
