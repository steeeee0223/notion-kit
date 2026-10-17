import { defineStory } from "@/lib/story";
import { mapMapMarker } from "@/stories/development.lazy";

export const Default = defineStory({
  Component: mapMapMarker.DefaultExample,
  displayName: "Default",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map-marker/Default",
    width: 1280,
    height: 800,
  },
});
export const CustomContent = defineStory({
  Component: mapMapMarker.CustomContentExample,
  displayName: "Custom Content",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map-marker/CustomContent",
    width: 1280,
    height: 800,
  },
});
export const WithPopup = defineStory({
  Component: mapMapMarker.WithPopupExample,
  displayName: "With Popup",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map-marker/WithPopup",
    width: 1280,
    height: 800,
  },
});
export const WithTooltip = defineStory({
  Component: mapMapMarker.WithTooltipExample,
  displayName: "With Tooltip",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map-marker/WithTooltip",
    width: 1280,
    height: 800,
  },
});
export const WithLabel = defineStory({
  Component: mapMapMarker.WithLabelExample,
  displayName: "With Label",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map-marker/WithLabel",
    width: 1280,
    height: 800,
  },
});
export const Draggable = defineStory({
  Component: mapMapMarker.DraggableExample,
  displayName: "Draggable",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map-marker/Draggable",
    width: 1280,
    height: 800,
  },
});
