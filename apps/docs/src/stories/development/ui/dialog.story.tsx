import { defineStory } from "@/lib/story";
import { uiDialog } from "@/stories/development.lazy";

export const Default = defineStory({
  Component: uiDialog.DefaultExample,
  displayName: "Default",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/dialog/Default",
    width: 1280,
    height: 800,
  },
});
