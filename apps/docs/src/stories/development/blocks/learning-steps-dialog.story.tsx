import { defineStory } from "@/lib/story";

import { DefaultExample } from "./learning-steps-dialog.lazy";

export const Default = defineStory({
  Component: DefaultExample,
  displayName: "Default",
  args: { initial: { open: true } },
  frame: {
    src: "/story/development/blocks/learning-steps-dialog/Default",
    width: 1280,
    height: 800,
  },
});
