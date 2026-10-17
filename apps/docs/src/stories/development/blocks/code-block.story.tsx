import { defineStory } from "@/lib/story";
import { blocksCodeBlock } from "@/stories/development.lazy";

export const MermaidPreviewing = defineStory({
  Component: blocksCodeBlock.MermaidPreviewingExample,
  displayName: "Mermaid Previewing",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/code-block/MermaidPreviewing",
    width: 1280,
    height: 800,
  },
});
