import { defineStory } from "@/lib/story";

import { DisabledExample, ExampleExample } from "./radio-group.lazy";

export const Example = defineStory({
  Component: ExampleExample,
  displayName: "Example",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/radio-group/Example",
    width: 1280,
    height: 800,
  },
});
export const Disabled = defineStory({
  Component: DisabledExample,
  displayName: "Disabled",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/radio-group/Disabled",
    width: 1280,
    height: 800,
  },
});
