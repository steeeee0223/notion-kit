import { lazy } from "react";

export const DefaultExample = lazy(() =>
  import("./learning-steps-dialog.examples").then((module) => ({
    default: module.DefaultExample,
  })),
);
