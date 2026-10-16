import { defineStory } from "@/lib/story";

import { BarExample, RingExample } from "./meter.lazy";

export const Bar = defineStory({
  Component: BarExample,
  displayName: "Bar",
  args: { initial: {} },
  frame: { src: "/story/development/ui/meter/Bar", width: 1280, height: 800 },
});
export const Ring = defineStory({
  Component: RingExample,
  displayName: "Ring",
  args: { initial: {} },
  frame: { src: "/story/development/ui/meter/Ring", width: 1280, height: 800 },
});
