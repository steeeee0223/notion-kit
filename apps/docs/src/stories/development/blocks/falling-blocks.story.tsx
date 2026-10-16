import { defineStory } from "@/lib/story";

import { BasicExample, DraggableExample } from "./falling-blocks.lazy";

export const Basic = defineStory({
  Component: BasicExample,
  displayName: "Basic",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/falling-blocks/Basic",
    width: 1280,
    height: 800,
  },
});
export const Draggable = defineStory({
  Component: DraggableExample,
  displayName: "Draggable",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/falling-blocks/Draggable",
    width: 1280,
    height: 800,
  },
});
