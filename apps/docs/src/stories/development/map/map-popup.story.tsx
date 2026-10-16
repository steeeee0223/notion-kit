import { defineStory } from "@/lib/story";

import { DefaultExample } from "./map-popup.lazy";

export const Default = defineStory({
  Component: DefaultExample,
  displayName: "Default",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map-popup/Default",
    width: 1280,
    height: 800,
  },
});
