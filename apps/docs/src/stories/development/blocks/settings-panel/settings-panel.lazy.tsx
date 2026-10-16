import { lazy } from "react";

export const DefaultExample = lazy(() =>
  import("./settings-panel.examples").then((module) => ({
    default: module.DefaultExample,
  })),
);
export const NotificationsExample = lazy(() =>
  import("./settings-panel.examples").then((module) => ({
    default: module.NotificationsExample,
  })),
);
export const MyConnectionsExample = lazy(() =>
  import("./settings-panel.examples").then((module) => ({
    default: module.MyConnectionsExample,
  })),
);
export const WorkspaceExample = lazy(() =>
  import("./settings-panel.examples").then((module) => ({
    default: module.WorkspaceExample,
  })),
);
export const PeopleExample = lazy(() =>
  import("./settings-panel.examples").then((module) => ({
    default: module.PeopleExample,
  })),
);
export const EmojiExample = lazy(() =>
  import("./settings-panel.examples").then((module) => ({
    default: module.EmojiExample,
  })),
);
export const TeamspacesExample = lazy(() =>
  import("./settings-panel.examples").then((module) => ({
    default: module.TeamspacesExample,
  })),
);
export const SecurityExample = lazy(() =>
  import("./settings-panel.examples").then((module) => ({
    default: module.SecurityExample,
  })),
);
export const IdentityExample = lazy(() =>
  import("./settings-panel.examples").then((module) => ({
    default: module.IdentityExample,
  })),
);
export const BillingExample = lazy(() =>
  import("./settings-panel.examples").then((module) => ({
    default: module.BillingExample,
  })),
);
export const PlansExample = lazy(() =>
  import("./settings-panel.examples").then((module) => ({
    default: module.PlansExample,
  })),
);
