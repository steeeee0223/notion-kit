import { defineStory } from "@/lib/story";
import { blocksFallingBlocks } from "@/stories/development.lazy";

export const Basic = defineStory({
  Component: blocksFallingBlocks.BasicExample,
  displayName: "Basic",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/falling-blocks/Basic",
    width: 1280,
    height: 800,
  },
});
export const Draggable = defineStory({
  Component: blocksFallingBlocks.DraggableExample,
  displayName: "Draggable",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/falling-blocks/Draggable",
    width: 1280,
    height: 800,
  },
});
