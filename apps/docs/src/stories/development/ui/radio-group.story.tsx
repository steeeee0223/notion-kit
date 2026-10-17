import { defineStory } from "@/lib/story";
import { uiRadioGroup } from "@/stories/development.lazy";

export const Example = defineStory({
  Component: uiRadioGroup.ExampleExample,
  displayName: "Example",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/radio-group/Example",
    width: 1280,
    height: 800,
  },
});
export const Disabled = defineStory({
  Component: uiRadioGroup.DisabledExample,
  displayName: "Disabled",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/radio-group/Disabled",
    width: 1280,
    height: 800,
  },
});
