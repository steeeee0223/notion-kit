import { lazy } from "react";

export const MermaidPreviewingExample = lazy(() =>
  import("./code-block.examples").then((module) => ({
    default: module.MermaidPreviewingExample,
  })),
);
