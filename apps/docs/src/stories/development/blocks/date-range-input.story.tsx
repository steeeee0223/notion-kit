import { defineStory } from "@/lib/story";
import { blocksDateRangeInput } from "@/stories/development.lazy";

export const Default = defineStory({
  Component: blocksDateRangeInput.DefaultExample,
  displayName: "Default",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/date-range-input/Default",
    width: 1280,
    height: 800,
  },
});
