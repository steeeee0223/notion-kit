import { lazy } from "react";

export const DefaultExample = lazy(() =>
  import("./date-range-input.examples").then((module) => ({
    default: module.DefaultExample,
  })),
);
