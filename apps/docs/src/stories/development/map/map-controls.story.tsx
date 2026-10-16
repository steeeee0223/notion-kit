import { defineStory } from "@/lib/story";

import { AllControlsExample } from "./map-controls.lazy";

export const AllControls = defineStory({
  Component: AllControlsExample,
  displayName: "All Controls",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map-controls/AllControls",
    width: 1280,
    height: 800,
  },
});
