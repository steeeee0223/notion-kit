import { lazy } from "react";

export const CustomColorsExample = lazy(() =>
  import("./map-cluster-layer.examples").then((module) => ({
    default: module.CustomColorsExample,
  })),
);
export const WithPointClickExample = lazy(() =>
  import("./map-cluster-layer.examples").then((module) => ({
    default: module.WithPointClickExample,
  })),
);
