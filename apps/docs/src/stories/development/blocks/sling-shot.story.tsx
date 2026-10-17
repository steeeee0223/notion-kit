import { defineStory } from "@/lib/story";
import { blocksSlingShot } from "@/stories/development.lazy";

export const Default = defineStory({
  Component: blocksSlingShot.DefaultExample,
  displayName: "Default",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/sling-shot/Default",
    width: 1280,
    height: 800,
  },
});
export const SoftLanding = defineStory({
  Component: blocksSlingShot.SoftLandingExample,
  displayName: "Soft Landing",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/sling-shot/SoftLanding",
    width: 1280,
    height: 800,
  },
});
export const NoGoal = defineStory({
  Component: blocksSlingShot.NoGoalExample,
  displayName: "No Goal",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/sling-shot/NoGoal",
    width: 1280,
    height: 800,
  },
});
