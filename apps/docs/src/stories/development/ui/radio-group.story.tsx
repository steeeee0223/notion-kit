import { defineStory } from "@/lib/story";
import { uiRadioGroup } from "@/stories/development.lazy";

export const Default = defineStory({
  Component: uiRadioGroup.DefaultExample,
  displayName: "Radio Group",
  args: { initial: { disabled: false } },
  frame: {
    src: "/story/development/ui/radio-group/Default",
    height: 320,
  },
});
