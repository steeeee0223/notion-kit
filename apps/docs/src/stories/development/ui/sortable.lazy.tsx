import { lazy } from "react";

export const ListWithItemHandleExample = lazy(() =>
  import("./sortable.examples").then((module) => ({
    default: module.ListWithItemHandleExample,
  })),
);
