import { lazy } from "react";

export const CustomStylingExample = lazy(() =>
  import("./map-arc.examples").then((module) => ({
    default: module.CustomStylingExample,
  })),
);
export const WithHoverStateExample = lazy(() =>
  import("./map-arc.examples").then((module) => ({
    default: module.WithHoverStateExample,
  })),
);
export const HighCurvatureExample = lazy(() =>
  import("./map-arc.examples").then((module) => ({
    default: module.HighCurvatureExample,
  })),
);
export const StraightLinesExample = lazy(() =>
  import("./map-arc.examples").then((module) => ({
    default: module.StraightLinesExample,
  })),
);
