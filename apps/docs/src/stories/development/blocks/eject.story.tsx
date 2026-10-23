import { defineStory } from "@/lib/story";
import { blocksEject } from "@/stories/development.lazy";

export const Default = defineStory({
  Component: blocksEject.DefaultExample,
  displayName: "Default",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/eject/Default",
    width: 1280,
    height: 800,
  },
});
export const DisappearMode = defineStory({
  Component: blocksEject.DisappearModeExample,
  displayName: "Disappear Mode",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/eject/DisappearMode",
    width: 1280,
    height: 800,
  },
});
export const GhostMode = defineStory({
  Component: blocksEject.GhostModeExample,
  displayName: "Ghost Mode",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/eject/GhostMode",
    width: 1280,
    height: 800,
  },
});
export const KeyboardShortcut = defineStory({
  Component: blocksEject.KeyboardShortcutExample,
  displayName: "Keyboard Shortcut",
  args: { initial: { mode: "respawn", shortcut: "mod+e" } },
  frame: {
    src: "/story/development/blocks/eject/KeyboardShortcut",
    width: 1280,
    height: 800,
  },
});
export const ContextMenuTrigger = defineStory({
  Component: blocksEject.ContextMenuTriggerExample,
  displayName: "Context Menu Trigger",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/eject/ContextMenuTrigger",
    width: 1280,
    height: 800,
  },
});
export const Playground = defineStory({
  Component: blocksEject.PlaygroundExample,
  displayName: "Playground",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/eject/Playground",
    width: 1280,
    height: 800,
  },
});
export const DialogForm = defineStory({
  Component: blocksEject.DialogFormExample,
  displayName: "Dialog Form",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/eject/DialogForm",
    width: 1280,
    height: 800,
  },
});
