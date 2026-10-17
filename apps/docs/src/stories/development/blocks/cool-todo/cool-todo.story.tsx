import { defineStory } from "@/lib/story";
import { blocksCoolTodoCoolTodo } from "@/stories/development.lazy";

export const Default = defineStory({
  Component: blocksCoolTodoCoolTodo.DefaultExample,
  displayName: "Default",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/cool-todo/cool-todo/Default",
    width: 1280,
    height: 800,
  },
});
