import { lazy } from "react";

export const TeamMembersExample = lazy(() =>
  import("./tables.examples").then((module) => ({
    default: module.TeamMembersExample,
  })),
);
export const EmojisExample = lazy(() =>
  import("./tables.examples").then((module) => ({
    default: module.EmojisExample,
  })),
);
