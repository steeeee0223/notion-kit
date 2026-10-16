import { lazy } from "react";

export const DatabaseViewExample = lazy(() =>
  import("./table-view.examples").then((module) => ({
    default: module.DatabaseViewExample,
  })),
);
export const ControlledExample = lazy(() =>
  import("./table-view.examples").then((module) => ({
    default: module.ControlledExample,
  })),
);
export const ListViewExample = lazy(() =>
  import("./table-view.examples").then((module) => ({
    default: module.ListViewExample,
  })),
);
export const BoardViewExample = lazy(() =>
  import("./table-view.examples").then((module) => ({
    default: module.BoardViewExample,
  })),
);
export const TimelineViewExample = lazy(() =>
  import("./table-view.examples").then((module) => ({
    default: module.TimelineViewExample,
  })),
);
