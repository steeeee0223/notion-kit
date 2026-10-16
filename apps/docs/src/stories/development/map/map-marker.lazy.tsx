import { lazy } from "react";

export const DefaultExample = lazy(() =>
  import("./map-marker.examples").then((module) => ({
    default: module.DefaultExample,
  })),
);
export const CustomContentExample = lazy(() =>
  import("./map-marker.examples").then((module) => ({
    default: module.CustomContentExample,
  })),
);
export const WithPopupExample = lazy(() =>
  import("./map-marker.examples").then((module) => ({
    default: module.WithPopupExample,
  })),
);
export const WithTooltipExample = lazy(() =>
  import("./map-marker.examples").then((module) => ({
    default: module.WithTooltipExample,
  })),
);
export const WithLabelExample = lazy(() =>
  import("./map-marker.examples").then((module) => ({
    default: module.WithLabelExample,
  })),
);
export const DraggableExample = lazy(() =>
  import("./map-marker.examples").then((module) => ({
    default: module.DraggableExample,
  })),
);
