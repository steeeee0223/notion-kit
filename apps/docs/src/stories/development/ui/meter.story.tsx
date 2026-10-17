import { defineStory } from "@/lib/story";
import { uiMeter } from "@/stories/development.lazy";

export const Bar = defineStory({
  Component: uiMeter.BarExample,
  displayName: "Bar",
  args: { initial: {} },
  frame: { src: "/story/development/ui/meter/Bar", width: 1280, height: 800 },
});
export const Ring = defineStory({
  Component: uiMeter.RingExample,
  displayName: "Ring",
  args: { initial: {} },
  frame: { src: "/story/development/ui/meter/Ring", width: 1280, height: 800 },
});
