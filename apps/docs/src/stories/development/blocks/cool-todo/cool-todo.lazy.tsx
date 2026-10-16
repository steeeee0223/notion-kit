import { lazy } from "react";

export const DefaultExample = lazy(() =>
  import("./cool-todo.examples").then((module) => ({
    default: module.DefaultExample,
  })),
);
