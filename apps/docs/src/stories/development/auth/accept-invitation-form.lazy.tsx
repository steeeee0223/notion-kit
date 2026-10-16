import { lazy } from "react";

export const DefaultExample = lazy(() =>
  import("./accept-invitation-form.examples").then((module) => ({
    default: module.DefaultExample,
  })),
);
