import { lazy } from "react";

export const BarExample = lazy(() =>
  import("./meter.examples").then((module) => ({ default: module.BarExample })),
);
export const RingExample = lazy(() =>
  import("./meter.examples").then((module) => ({
    default: module.RingExample,
  })),
);
