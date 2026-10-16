import { defineStory } from "@/lib/story";

import { DefaultExample } from "./cool-todo.lazy";

export const Default = defineStory({
  Component: DefaultExample,
  displayName: "Default",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/cool-todo/cool-todo/Default",
    width: 1280,
    height: 800,
  },
});
