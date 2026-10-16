import { lazy } from "react";

export const IconGallery = lazy(() =>
  import("./notion.examples").then((module) => ({
    default: module.IconGallery,
  })),
);
