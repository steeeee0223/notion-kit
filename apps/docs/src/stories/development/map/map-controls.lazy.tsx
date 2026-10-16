import { lazy } from "react";

export const AllControlsExample = lazy(() =>
  import("./map-controls.examples").then((module) => ({
    default: module.AllControlsExample,
  })),
);
