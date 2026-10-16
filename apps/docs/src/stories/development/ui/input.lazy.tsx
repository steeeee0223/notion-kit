import { lazy } from "react";

export const WithClearExample = lazy(() =>
  import("./input.examples").then((module) => ({
    default: module.WithClearExample,
  })),
);
