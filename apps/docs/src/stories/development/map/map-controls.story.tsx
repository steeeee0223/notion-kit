import { defineStory } from "@/lib/story";
import { mapMapControls } from "@/stories/development.lazy";

export const AllControls = defineStory({
  Component: mapMapControls.AllControlsExample,
  displayName: "All Controls",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map-controls/AllControls",
    width: 1280,
    height: 800,
  },
});
