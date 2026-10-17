import { defineStory } from "@/lib/story";
import { hooksUseRect } from "@/stories/development.lazy";

export const Default = defineStory({
  Component: hooksUseRect.DefaultExample,
  displayName: "Default",
  args: { initial: {} },
  frame: {
    src: "/story/development/hooks/use-rect/Default",
    width: 1280,
    height: 800,
  },
});
