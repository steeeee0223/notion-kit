import { lazy } from "react";

export const DefaultExample = lazy(() =>
  import("./create-workspace-form.examples").then((module) => ({
    default: module.DefaultExample,
  })),
);
