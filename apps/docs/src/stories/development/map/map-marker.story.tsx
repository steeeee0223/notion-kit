import { defineStory } from "@/lib/story";

import {
  CustomContentExample,
  DefaultExample,
  DraggableExample,
  WithLabelExample,
  WithPopupExample,
  WithTooltipExample,
} from "./map-marker.lazy";

export const Default = defineStory({
  Component: DefaultExample,
  displayName: "Default",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map-marker/Default",
    width: 1280,
    height: 800,
  },
});
export const CustomContent = defineStory({
  Component: CustomContentExample,
  displayName: "Custom Content",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map-marker/CustomContent",
    width: 1280,
    height: 800,
  },
});
export const WithPopup = defineStory({
  Component: WithPopupExample,
  displayName: "With Popup",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map-marker/WithPopup",
    width: 1280,
    height: 800,
  },
});
export const WithTooltip = defineStory({
  Component: WithTooltipExample,
  displayName: "With Tooltip",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map-marker/WithTooltip",
    width: 1280,
    height: 800,
  },
});
export const WithLabel = defineStory({
  Component: WithLabelExample,
  displayName: "With Label",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map-marker/WithLabel",
    width: 1280,
    height: 800,
  },
});
export const Draggable = defineStory({
  Component: DraggableExample,
  displayName: "Draggable",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map-marker/Draggable",
    width: 1280,
    height: 800,
  },
});
