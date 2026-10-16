import { lazy } from "react";

export const DefaultExample = lazy(() =>
  import("./use-rect.examples").then((module) => ({
    default: module.DefaultExample,
  })),
);
