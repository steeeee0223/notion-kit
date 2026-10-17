import { defineStory } from "@/lib/story";
import { uiCalendar } from "@/stories/development.lazy";

export const Basic = defineStory({
  Component: uiCalendar.BasicExample,
  displayName: "Basic",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/calendar/Basic",
    width: 1280,
    height: 800,
  },
});
export const RangeCalendar = defineStory({
  Component: uiCalendar.RangeCalendarExample,
  displayName: "Range Calendar",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/calendar/RangeCalendar",
    width: 1280,
    height: 800,
  },
});
export const EnhancedDateTimePicker = defineStory({
  Component: uiCalendar.EnhancedDateTimePickerExample,
  displayName: "Enhanced Date Time Picker",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/calendar/EnhancedDateTimePicker",
    width: 1280,
    height: 800,
  },
});
