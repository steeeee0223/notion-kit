import { lazy } from "react";

export const DefaultExample = lazy(() =>
  import("./dialog.examples").then((module) => ({
    default: module.DefaultExample,
  })),
);
