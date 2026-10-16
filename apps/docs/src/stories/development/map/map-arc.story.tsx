import { defineStory } from "@/lib/story";

import {
  CustomStylingExample,
  HighCurvatureExample,
  StraightLinesExample,
  WithHoverStateExample,
} from "./map-arc.lazy";

export const CustomStyling = defineStory({
  Component: CustomStylingExample,
  displayName: "Custom Styling",
  args: { initial: { curvature: 0.4 } },
  frame: {
    src: "/story/development/map/map-arc/CustomStyling",
    width: 1280,
    height: 800,
  },
});
export const WithHoverState = defineStory({
  Component: WithHoverStateExample,
  displayName: "With Hover State",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map-arc/WithHoverState",
    width: 1280,
    height: 800,
  },
});
export const HighCurvature = defineStory({
  Component: HighCurvatureExample,
  displayName: "High Curvature",
  args: { initial: { curvature: 0.6 } },
  frame: {
    src: "/story/development/map/map-arc/HighCurvature",
    width: 1280,
    height: 800,
  },
});
export const StraightLines = defineStory({
  Component: StraightLinesExample,
  displayName: "Straight Lines",
  args: { initial: { curvature: 0 } },
  frame: {
    src: "/story/development/map/map-arc/StraightLines",
    width: 1280,
    height: 800,
  },
});
