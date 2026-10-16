import { lazy } from "react";

export const DefaultExample = lazy(() =>
  import("./sling-shot.examples").then((module) => ({
    default: module.DefaultExample,
  })),
);
export const SoftLandingExample = lazy(() =>
  import("./sling-shot.examples").then((module) => ({
    default: module.SoftLandingExample,
  })),
);
export const NoGoalExample = lazy(() =>
  import("./sling-shot.examples").then((module) => ({
    default: module.NoGoalExample,
  })),
);
