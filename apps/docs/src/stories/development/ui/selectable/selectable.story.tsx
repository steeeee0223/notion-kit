import { defineStory } from "@/lib/story";

import {
  BasicExample,
  MultiSelectExample,
  NoOverlayExample,
  SelectContainExample,
  WithDraggableItemsExample,
} from "./selectable.lazy";

export const Basic = defineStory({
  Component: BasicExample,
  displayName: "Basic",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/selectable/selectable/Basic",
    width: 1280,
    height: 800,
  },
});
export const SelectContain = defineStory({
  Component: SelectContainExample,
  displayName: "Select Contain",
  args: { initial: { mode: "contain" } },
  frame: {
    src: "/story/development/ui/selectable/selectable/SelectContain",
    width: 1280,
    height: 800,
  },
});
export const MultiSelect = defineStory({
  Component: MultiSelectExample,
  displayName: "Multi Select",
  args: { initial: { multiple: true } },
  frame: {
    src: "/story/development/ui/selectable/selectable/MultiSelect",
    width: 1280,
    height: 800,
  },
});
export const NoOverlay = defineStory({
  Component: NoOverlayExample,
  displayName: "No Overlay",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/selectable/selectable/NoOverlay",
    width: 1280,
    height: 800,
  },
});
export const WithDraggableItems = defineStory({
  Component: WithDraggableItemsExample,
  displayName: "With Draggable Items",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/selectable/selectable/WithDraggableItems",
    width: 1280,
    height: 800,
  },
});
