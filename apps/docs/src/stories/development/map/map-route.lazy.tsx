import { lazy } from "react";

export const StyledExample = lazy(() =>
  import("./map-route.examples").then((module) => ({
    default: module.StyledExample,
  })),
);
export const DashedExample = lazy(() =>
  import("./map-route.examples").then((module) => ({
    default: module.DashedExample,
  })),
);
export const MultipleRoutesExample = lazy(() =>
  import("./map-route.examples").then((module) => ({
    default: module.MultipleRoutesExample,
  })),
);
