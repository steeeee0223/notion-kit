import { defineStory } from "@/lib/story";
import { authCreateWorkspaceForm } from "@/stories/development.lazy";

export const Default = defineStory({
  Component: authCreateWorkspaceForm.DefaultExample,
  displayName: "Default",
  args: { initial: {} },
  frame: {
    src: "/story/development/auth/create-workspace-form/Default",
    width: 1280,
    height: 800,
  },
});
