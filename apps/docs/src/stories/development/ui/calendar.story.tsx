import { defineStory } from "@/lib/story";

import {
  BasicExample,
  EnhancedDateTimePickerExample,
  RangeCalendarExample,
} from "./calendar.lazy";

export const Basic = defineStory({
  Component: BasicExample,
  displayName: "Basic",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/calendar/Basic",
    width: 1280,
    height: 800,
  },
});
export const RangeCalendar = defineStory({
  Component: RangeCalendarExample,
  displayName: "Range Calendar",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/calendar/RangeCalendar",
    width: 1280,
    height: 800,
  },
});
export const EnhancedDateTimePicker = defineStory({
  Component: EnhancedDateTimePickerExample,
  displayName: "Enhanced Date Time Picker",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/calendar/EnhancedDateTimePicker",
    width: 1280,
    height: 800,
  },
});
