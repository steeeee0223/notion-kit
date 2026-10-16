import { defineStory } from "@/lib/story";

import { DefaultExample } from "./create-workspace-form.lazy";

export const Default = defineStory({
  Component: DefaultExample,
  displayName: "Default",
  args: { initial: {} },
  frame: {
    src: "/story/development/auth/create-workspace-form/Default",
    width: 1280,
    height: 800,
  },
});
