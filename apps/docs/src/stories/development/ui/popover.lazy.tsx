import { lazy } from "react";

export const DetachExample = lazy(() =>
  import("./popover.examples").then((module) => ({
    default: module.DetachExample,
  })),
);
