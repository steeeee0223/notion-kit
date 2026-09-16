import {
  useDateViewProperty,
  type DateViewResources,
} from "@/date-view/use-date-view-property";

import { createInitialTimelineDate } from "./timeline-adapter";

const initialization = {
  name: "Timeline",
  getInitialValue: createInitialTimelineDate,
};

export function useTimelineViewState(resources: DateViewResources) {
  return useDateViewProperty(resources, initialization);
}
