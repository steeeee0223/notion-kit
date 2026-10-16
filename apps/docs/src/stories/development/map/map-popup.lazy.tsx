import { lazy } from "react";

export const DefaultExample = lazy(() =>
  import("./map-popup.examples").then((module) => ({
    default: module.DefaultExample,
  })),
);
