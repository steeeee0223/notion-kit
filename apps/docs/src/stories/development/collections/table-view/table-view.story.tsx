import { defineStory } from "@/lib/story";
import { collectionsTableViewTableView } from "@/stories/development.lazy";

export const DatabaseView = defineStory({
  Component: collectionsTableViewTableView.DatabaseViewExample,
  displayName: "Database View",
  args: { initial: {} },
  frame: {
    src: "/story/development/collections/table-view/table-view/DatabaseView",
    width: 1280,
    height: 800,
  },
});
export const Controlled = defineStory({
  Component: collectionsTableViewTableView.ControlledExample,
  displayName: "Controlled",
  args: { initial: {} },
  frame: {
    src: "/story/development/collections/table-view/table-view/Controlled",
    width: 1280,
    height: 800,
  },
});
export const ListView = defineStory({
  Component: collectionsTableViewTableView.ListViewExample,
  displayName: "List View",
  args: { initial: {} },
  frame: {
    src: "/story/development/collections/table-view/table-view/ListView",
    width: 1280,
    height: 800,
  },
});
export const BoardView = defineStory({
  Component: collectionsTableViewTableView.BoardViewExample,
  displayName: "Board View",
  args: { initial: {} },
  frame: {
    src: "/story/development/collections/table-view/table-view/BoardView",
    width: 1280,
    height: 800,
  },
});
export const TimelineView = defineStory({
  Component: collectionsTableViewTableView.TimelineViewExample,
  displayName: "Timeline View",
  args: { initial: {} },
  frame: {
    src: "/story/development/collections/table-view/table-view/TimelineView",
    width: 1280,
    height: 800,
  },
});
