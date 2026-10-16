import { defineStory } from "@/lib/story";

import { ListWithItemHandleExample } from "./sortable.lazy";

export const ListWithItemHandle = defineStory({
  Component: ListWithItemHandleExample,
  displayName: "List With Item Handle",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/sortable/ListWithItemHandle",
    width: 1280,
    height: 800,
  },
});
