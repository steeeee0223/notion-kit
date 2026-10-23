import { defineStory } from "@/lib/story";
import { uiDropdownMenu } from "@/stories/development.lazy";

export const InlineMenu = defineStory({
  Component: uiDropdownMenu.InlineMenuExample,
  displayName: "Inline Menu",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/dropdown-menu/InlineMenu",
    width: 1280,
    height: 800,
  },
});
