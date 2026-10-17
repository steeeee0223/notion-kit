import { defineStory } from "@/lib/story";
import { blocksLearningStepsDialog } from "@/stories/development.lazy";

export const Default = defineStory({
  Component: blocksLearningStepsDialog.DefaultExample,
  displayName: "Default",
  args: { initial: { open: true } },
  frame: {
    src: "/story/development/blocks/learning-steps-dialog/Default",
    width: 1280,
    height: 800,
  },
});
