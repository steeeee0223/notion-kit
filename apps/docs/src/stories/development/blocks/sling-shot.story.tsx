import { defineStory } from "@/lib/story";

import {
  DefaultExample,
  NoGoalExample,
  SoftLandingExample,
} from "./sling-shot.lazy";

export const Default = defineStory({
  Component: DefaultExample,
  displayName: "Default",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/sling-shot/Default",
    width: 1280,
    height: 800,
  },
});
export const SoftLanding = defineStory({
  Component: SoftLandingExample,
  displayName: "Soft Landing",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/sling-shot/SoftLanding",
    width: 1280,
    height: 800,
  },
});
export const NoGoal = defineStory({
  Component: NoGoalExample,
  displayName: "No Goal",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/sling-shot/NoGoal",
    width: 1280,
    height: 800,
  },
});
