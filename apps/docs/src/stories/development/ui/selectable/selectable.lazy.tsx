import { lazy } from "react";

export const BasicExample = lazy(() =>
  import("./selectable.examples").then((module) => ({
    default: module.BasicExample,
  })),
);
export const SelectContainExample = lazy(() =>
  import("./selectable.examples").then((module) => ({
    default: module.SelectContainExample,
  })),
);
export const MultiSelectExample = lazy(() =>
  import("./selectable.examples").then((module) => ({
    default: module.MultiSelectExample,
  })),
);
export const NoOverlayExample = lazy(() =>
  import("./selectable.examples").then((module) => ({
    default: module.NoOverlayExample,
  })),
);
export const WithDraggableItemsExample = lazy(() =>
  import("./selectable.examples").then((module) => ({
    default: module.WithDraggableItemsExample,
  })),
);
