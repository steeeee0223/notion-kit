import { defineStory } from "@/lib/story";

import { DefaultExample } from "./date-range-input.lazy";

export const Default = defineStory({
  Component: DefaultExample,
  displayName: "Default",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/date-range-input/Default",
    width: 1280,
    height: 800,
  },
});
