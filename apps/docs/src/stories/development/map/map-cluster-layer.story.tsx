import { defineStory } from "@/lib/story";

import {
  CustomColorsExample,
  WithPointClickExample,
} from "./map-cluster-layer.lazy";

export const CustomColors = defineStory({
  Component: CustomColorsExample,
  displayName: "Custom Colors",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map-cluster-layer/CustomColors",
    width: 1280,
    height: 800,
  },
});
export const WithPointClick = defineStory({
  Component: WithPointClickExample,
  displayName: "With Point Click",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map-cluster-layer/WithPointClick",
    width: 1280,
    height: 800,
  },
});
