import { defineStory } from "@/lib/story";

import { InlineMenuExample } from "./dropdown-menu.lazy";

export const InlineMenu = defineStory({
  Component: InlineMenuExample,
  displayName: "Inline Menu",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/dropdown-menu/InlineMenu",
    width: 1280,
    height: 800,
  },
});
