import { defineStory } from "@/lib/story";

import { MermaidPreviewingExample } from "./code-block.lazy";

export const MermaidPreviewing = defineStory({
  Component: MermaidPreviewingExample,
  displayName: "Mermaid Previewing",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/code-block/MermaidPreviewing",
    width: 1280,
    height: 800,
  },
});
