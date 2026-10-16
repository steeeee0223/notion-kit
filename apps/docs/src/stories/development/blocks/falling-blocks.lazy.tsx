import { lazy } from "react";

export const BasicExample = lazy(() =>
  import("./falling-blocks.examples").then((module) => ({
    default: module.BasicExample,
  })),
);
export const DraggableExample = lazy(() =>
  import("./falling-blocks.examples").then((module) => ({
    default: module.DraggableExample,
  })),
);
