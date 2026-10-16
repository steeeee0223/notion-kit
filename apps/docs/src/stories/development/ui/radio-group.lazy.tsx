import { lazy } from "react";

export const ExampleExample = lazy(() =>
  import("./radio-group.examples").then((module) => ({
    default: module.ExampleExample,
  })),
);
export const DisabledExample = lazy(() =>
  import("./radio-group.examples").then((module) => ({
    default: module.DisabledExample,
  })),
);
