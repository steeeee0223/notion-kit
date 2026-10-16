import { defineStory } from "@/lib/story";

import {
  BoardViewExample,
  ControlledExample,
  DatabaseViewExample,
  ListViewExample,
  TimelineViewExample,
} from "./table-view.lazy";

export const DatabaseView = defineStory({
  Component: DatabaseViewExample,
  displayName: "Database View",
  args: { initial: {} },
  frame: {
    src: "/story/development/collections/table-view/table-view/DatabaseView",
    width: 1280,
    height: 800,
  },
});
export const Controlled = defineStory({
  Component: ControlledExample,
  displayName: "Controlled",
  args: { initial: {} },
  frame: {
    src: "/story/development/collections/table-view/table-view/Controlled",
    width: 1280,
    height: 800,
  },
});
export const ListView = defineStory({
  Component: ListViewExample,
  displayName: "List View",
  args: { initial: {} },
  frame: {
    src: "/story/development/collections/table-view/table-view/ListView",
    width: 1280,
    height: 800,
  },
});
export const BoardView = defineStory({
  Component: BoardViewExample,
  displayName: "Board View",
  args: { initial: {} },
  frame: {
    src: "/story/development/collections/table-view/table-view/BoardView",
    width: 1280,
    height: 800,
  },
});
export const TimelineView = defineStory({
  Component: TimelineViewExample,
  displayName: "Timeline View",
  args: { initial: {} },
  frame: {
    src: "/story/development/collections/table-view/table-view/TimelineView",
    width: 1280,
    height: 800,
  },
});
