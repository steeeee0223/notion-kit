import { defineStory } from "@/lib/story";

import {
  DefaultExample,
  EmptyExample,
  PinnedExample,
  StripedExample,
} from "./table.lazy";

export const Default = defineStory({
  Component: DefaultExample,
  displayName: "Default",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/table/table/Default",
    width: 1280,
    height: 800,
  },
});
export const Empty = defineStory({
  Component: EmptyExample,
  displayName: "Empty",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/table/table/Empty",
    width: 1280,
    height: 800,
  },
});
export const Pinned = defineStory({
  Component: PinnedExample,
  displayName: "Pinned",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/table/table/Pinned",
    width: 1280,
    height: 800,
  },
});
export const Striped = defineStory({
  Component: StripedExample,
  displayName: "Striped",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/table/table/Striped",
    width: 1280,
    height: 800,
  },
});
