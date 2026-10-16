import { lazy } from "react";

export const DefaultExample = lazy(() =>
  import("./table.examples").then((module) => ({
    default: module.DefaultExample,
  })),
);
export const EmptyExample = lazy(() =>
  import("./table.examples").then((module) => ({
    default: module.EmptyExample,
  })),
);
export const PinnedExample = lazy(() =>
  import("./table.examples").then((module) => ({
    default: module.PinnedExample,
  })),
);
export const StripedExample = lazy(() =>
  import("./table.examples").then((module) => ({
    default: module.StripedExample,
  })),
);
