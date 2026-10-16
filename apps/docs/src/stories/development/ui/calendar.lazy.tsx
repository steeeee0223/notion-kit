import { lazy } from "react";

export const BasicExample = lazy(() =>
  import("./calendar.examples").then((module) => ({
    default: module.BasicExample,
  })),
);
export const RangeCalendarExample = lazy(() =>
  import("./calendar.examples").then((module) => ({
    default: module.RangeCalendarExample,
  })),
);
export const EnhancedDateTimePickerExample = lazy(() =>
  import("./calendar.examples").then((module) => ({
    default: module.EnhancedDateTimePickerExample,
  })),
);
