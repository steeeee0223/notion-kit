import { defineStory } from "@/lib/story";
import { uiInput } from "@/stories/development.lazy";

export const WithClear = defineStory({
  Component: uiInput.WithClearExample,
  displayName: "With Clear",
  args: { initial: { clear: true, placeholder: "Search a website" } },
  frame: {
    src: "/story/development/ui/input/WithClear",
    width: 1280,
    height: 800,
  },
});
