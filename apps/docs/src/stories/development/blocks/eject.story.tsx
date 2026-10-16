import { defineStory } from "@/lib/story";

import {
  ContextMenuTriggerExample,
  DefaultExample,
  DialogFormExample,
  DisappearModeExample,
  GhostModeExample,
  KeyboardShortcutExample,
  PlaygroundExample,
} from "./eject.lazy";

export const Default = defineStory({
  Component: DefaultExample,
  displayName: "Default",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/eject/Default",
    width: 1280,
    height: 800,
  },
});
export const DisappearMode = defineStory({
  Component: DisappearModeExample,
  displayName: "Disappear Mode",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/eject/DisappearMode",
    width: 1280,
    height: 800,
  },
});
export const GhostMode = defineStory({
  Component: GhostModeExample,
  displayName: "Ghost Mode",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/eject/GhostMode",
    width: 1280,
    height: 800,
  },
});
export const KeyboardShortcut = defineStory({
  Component: KeyboardShortcutExample,
  displayName: "Keyboard Shortcut",
  args: { initial: { mode: "respawn", shortcut: "mod+e" } },
  frame: {
    src: "/story/development/blocks/eject/KeyboardShortcut",
    width: 1280,
    height: 800,
  },
});
export const ContextMenuTrigger = defineStory({
  Component: ContextMenuTriggerExample,
  displayName: "Context Menu Trigger",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/eject/ContextMenuTrigger",
    width: 1280,
    height: 800,
  },
});
export const Playground = defineStory({
  Component: PlaygroundExample,
  displayName: "Playground",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/eject/Playground",
    width: 1280,
    height: 800,
  },
});
export const DialogForm = defineStory({
  Component: DialogFormExample,
  displayName: "Dialog Form",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/eject/DialogForm",
    width: 1280,
    height: 800,
  },
});
