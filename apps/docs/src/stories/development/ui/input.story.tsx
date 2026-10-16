import { defineStory } from "@/lib/story";

import { WithClearExample } from "./input.lazy";

export const WithClear = defineStory({
  Component: WithClearExample,
  displayName: "With Clear",
  args: { initial: { clear: true, placeholder: "Search a website" } },
  frame: {
    src: "/story/development/ui/input/WithClear",
    width: 1280,
    height: 800,
  },
});
