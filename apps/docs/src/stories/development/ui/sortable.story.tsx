import { defineStory } from "@/lib/story";
import { uiSortable } from "@/stories/development.lazy";

export const ListWithItemHandle = defineStory({
  Component: uiSortable.ListWithItemHandleExample,
  displayName: "List With Item Handle",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/sortable/ListWithItemHandle",
    width: 1280,
    height: 800,
  },
});
