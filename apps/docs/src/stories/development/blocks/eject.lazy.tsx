import { lazy } from "react";

export const DefaultExample = lazy(() =>
  import("./eject.examples").then((module) => ({
    default: module.DefaultExample,
  })),
);
export const DisappearModeExample = lazy(() =>
  import("./eject.examples").then((module) => ({
    default: module.DisappearModeExample,
  })),
);
export const GhostModeExample = lazy(() =>
  import("./eject.examples").then((module) => ({
    default: module.GhostModeExample,
  })),
);
export const KeyboardShortcutExample = lazy(() =>
  import("./eject.examples").then((module) => ({
    default: module.KeyboardShortcutExample,
  })),
);
export const ContextMenuTriggerExample = lazy(() =>
  import("./eject.examples").then((module) => ({
    default: module.ContextMenuTriggerExample,
  })),
);
export const PlaygroundExample = lazy(() =>
  import("./eject.examples").then((module) => ({
    default: module.PlaygroundExample,
  })),
);
export const DialogFormExample = lazy(() =>
  import("./eject.examples").then((module) => ({
    default: module.DialogFormExample,
  })),
);
