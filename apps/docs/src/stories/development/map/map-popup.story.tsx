import { defineStory } from "@/lib/story";
import { mapMapPopup } from "@/stories/development.lazy";

export const Default = defineStory({
  Component: mapMapPopup.DefaultExample,
  displayName: "Default",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map-popup/Default",
    width: 1280,
    height: 800,
  },
});
