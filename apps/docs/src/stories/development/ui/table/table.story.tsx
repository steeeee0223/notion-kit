import { defineStory } from "@/lib/story";
import { uiTableTable } from "@/stories/development.lazy";

export const Default = defineStory({
  Component: uiTableTable.DefaultExample,
  displayName: "Default",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/table/table/Default",
    width: 1280,
    height: 800,
  },
});
export const Empty = defineStory({
  Component: uiTableTable.EmptyExample,
  displayName: "Empty",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/table/table/Empty",
    width: 1280,
    height: 800,
  },
});
export const Pinned = defineStory({
  Component: uiTableTable.PinnedExample,
  displayName: "Pinned",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/table/table/Pinned",
    width: 1280,
    height: 800,
  },
});
export const Striped = defineStory({
  Component: uiTableTable.StripedExample,
  displayName: "Striped",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/table/table/Striped",
    width: 1280,
    height: 800,
  },
});
