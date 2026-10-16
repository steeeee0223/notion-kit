import { defineStory } from "@/lib/story";

import { DefaultExample } from "./use-rect.lazy";

export const Default = defineStory({
  Component: DefaultExample,
  displayName: "Default",
  args: { initial: {} },
  frame: {
    src: "/story/development/hooks/use-rect/Default",
    width: 1280,
    height: 800,
  },
});
