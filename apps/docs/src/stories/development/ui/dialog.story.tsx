import { defineStory } from "@/lib/story";

import { DefaultExample } from "./dialog.lazy";

export const Default = defineStory({
  Component: DefaultExample,
  displayName: "Default",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/dialog/Default",
    width: 1280,
    height: 800,
  },
});
