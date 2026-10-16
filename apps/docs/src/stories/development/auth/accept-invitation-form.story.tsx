import { defineStory } from "@/lib/story";

import { DefaultExample } from "./accept-invitation-form.lazy";

export const Default = defineStory({
  Component: DefaultExample,
  displayName: "Default",
  args: { initial: { invitationId: "test-invitation-id" } },
  frame: {
    src: "/story/development/auth/accept-invitation-form/Default",
    width: 1280,
    height: 800,
  },
});
