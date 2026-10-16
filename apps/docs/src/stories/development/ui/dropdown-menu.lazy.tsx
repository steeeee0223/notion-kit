import { lazy } from "react";

export const InlineMenuExample = lazy(() =>
  import("./dropdown-menu.examples").then((module) => ({
    default: module.InlineMenuExample,
  })),
);
