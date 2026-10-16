import { lazy } from "react";

export const DarkThemeExample = lazy(() =>
  import("./map.examples").then((module) => ({
    default: module.DarkThemeExample,
  })),
);
export const LightThemeExample = lazy(() =>
  import("./map.examples").then((module) => ({
    default: module.LightThemeExample,
  })),
);
export const GlobeExample = lazy(() =>
  import("./map.examples").then((module) => ({ default: module.GlobeExample })),
);
export const ControlledViewportExample = lazy(() =>
  import("./map.examples").then((module) => ({
    default: module.ControlledViewportExample,
  })),
);
