import { defineStory } from "@/lib/story";

import {
  DashedExample,
  MultipleRoutesExample,
  StyledExample,
} from "./map-route.lazy";

export const Styled = defineStory({
  Component: StyledExample,
  displayName: "Styled",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map-route/Styled",
    width: 1280,
    height: 800,
  },
});
export const Dashed = defineStory({
  Component: DashedExample,
  displayName: "Dashed",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map-route/Dashed",
    width: 1280,
    height: 800,
  },
});
export const MultipleRoutes = defineStory({
  Component: MultipleRoutesExample,
  displayName: "Multiple Routes",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map-route/MultipleRoutes",
    width: 1280,
    height: 800,
  },
});
